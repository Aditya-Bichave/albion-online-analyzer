const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
const { PhotonPacketParser, PACKET_STATUS } = require('./photonParser');
const { decodeAlbionPacket } = require('./albionPacketDecoder');
const { getZoneCatalog, getMobCatalog } = require('./albionData');
const {
    createWorldEntityKey,
    extractMobEntity,
    extractDungeonEntity,
    extractChestEntity,
    extractFishingEntity,
    extractCageEntity,
    extractWispEntity,
    extractPlayerMoveRequest: extractPlayerMoveRequestFixture,
    extractPlayerJoinInfo: extractPlayerJoinInfoFixture,
    extractHealthState
} = require('./worldEntityExtractors');

const ALBION_UDP_PORT = 5056;
const ALBION_CAPTURE_FILTER = `udp and (src port ${ALBION_UDP_PORT} or dst port ${ALBION_UDP_PORT})`;
const BYTE_MOVE_LONG_LENGTH = 30;
const BYTE_MOVE_SHORT_LENGTH = 22;

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function reverseFloat32Endian(value) {
    if (!isFiniteNumber(value)) {
        return Number.NaN;
    }

    const source = Buffer.allocUnsafe(4);
    source.writeFloatBE(value, 0);
    const reversed = Buffer.from(source).reverse();
    return reversed.readFloatBE(0);
}

function isUsableIpv4(value) {
    return typeof value === 'string' && /^\d{1,3}(\.\d{1,3}){3}$/.test(value);
}

function isLoopbackAddress(value) {
    return isUsableIpv4(value) && value.startsWith('127.');
}

function isLinkLocalAddress(value) {
    return isUsableIpv4(value) && value.startsWith('169.254.');
}

function isPrivateAddress(value) {
    if (!isUsableIpv4(value)) {
        return false;
    }

    return value.startsWith('10.')
        || value.startsWith('192.168.')
        || /^172\.(1[6-9]|2\d|3[01])\./.test(value);
}

function getAdapterPriority(adapter) {
    const ip = adapter?.ip ?? '';

    if (isPrivateAddress(ip)) {
        return 0;
    }

    if (isUsableIpv4(ip) && !isLoopbackAddress(ip) && !isLinkLocalAddress(ip)) {
        return 1;
    }

    if (isLoopbackAddress(ip)) {
        return 3;
    }

    if (isLinkLocalAddress(ip)) {
        return 4;
    }

    return 5;
}

// Note: To capture packets successfully, Npcap (on Windows) or libpcap must be installed.
class PacketSniffer {
    constructor(broadcastCallback, logger = null, options = {}) {
        this.broadcast = broadcastCallback;
        this.logger = logger || {
            verbose() {},
            debug() {},
            info() {},
            warning() {},
            warn() {},
            error() {}
        };
        this.filter = ALBION_CAPTURE_FILTER;
        this.preferredAdapterIp = typeof options.preferredAdapterIp === 'string' && options.preferredAdapterIp.trim()
            ? options.preferredAdapterIp.trim()
            : null;
        this.bufSize = 10 * 1024 * 1024;
        this.captureHandles = [];
        this.running = false;
        this.packetCount = 0;
        this.statsInterval = null;
        this.photonParser = new PhotonPacketParser();
        this.statusCounts = {
            [PACKET_STATUS.SUCCESS]: 0,
            [PACKET_STATUS.ENCRYPTED]: 0,
            [PACKET_STATUS.INVALID_CRC]: 0,
            [PACKET_STATUS.INVALID_HEADER]: 0,
            [PACKET_STATUS.DISCONNECT_COMMAND]: 0,
            parser_error: 0
        };
        this.decodedPacketCount = 0;
        this.relevantDecodedCount = 0;
        this.decodedCodeCounts = new Map();
        this.nodeState = new Map();
        this.playerPosition = { x: 0, y: 0 };
        this.currentZoneInfo = null;
        this.currentPlayerName = null;
        this.playerEntityId = null;
        this.lastRequestedPlayerMove = null;
        this.moveCandidates = new Map();
        this.availableAdapters = [];
        this.selectedAdapter = null;
        this.observedPlayers = new Map();
        this.worldEntities = new Map();
        this.pendingWorldEntityUpserts = new Map();
        this.pendingWorldEntityRemovals = new Set();
        this.worldEntityFlushTimer = null;
        this.cleanupInterval = null;
        this.debugCounters = new Map();
        this.packetVerboseEnabled = String(process.env.LOG_PACKET_VERBOSE || '').toLowerCase() === 'true';
        this.zoneCatalog = getZoneCatalog(this.logger);
        this.mobCatalog = getMobCatalog(this.logger);
    }

    static listAdapters() {
        const allDevices = Cap.deviceList();
        if (!Array.isArray(allDevices) || allDevices.length === 0) {
            return [];
        }

        const adapters = [];

        allDevices.forEach((deviceInfo, deviceIndex) => {
            const addresses = Array.isArray(deviceInfo.addresses) ? deviceInfo.addresses : [];

            addresses.forEach((addressInfo, addressIndex) => {
                const ip = addressInfo?.addr;
                if (!isUsableIpv4(ip)) {
                    return;
                }

                const description = deviceInfo.description || deviceInfo.name || `Adapter ${deviceIndex + 1}`;
                adapters.push({
                    id: `${deviceInfo.name || 'adapter'}:${addressIndex}`,
                    name: description,
                    description,
                    device: deviceInfo.name,
                    ip,
                    priority: getAdapterPriority({ ip })
                });
            });
        });

        return adapters.sort((left, right) => {
            if (left.priority !== right.priority) {
                return left.priority - right.priority;
            }

            return `${left.name} ${left.ip}`.localeCompare(`${right.name} ${right.ip}`);
        });
    }

    setPreferredAdapterIp(nextIp) {
        const normalized = typeof nextIp === 'string' && nextIp.trim() ? nextIp.trim() : null;
        this.preferredAdapterIp = normalized;
        this.logger.info('capture_adapter_preference_updated', {
            preferredAdapterIp: this.preferredAdapterIp
        });
    }

    start() {
        try {
            if (this.running) {
                this.logger.info('sniffer_start_noop', { reason: 'already_running' });
                return { ok: true };
            }

            this.logger.info('sniffer_start_requested', {
                filter: this.filter,
                preferredAdapterIp: this.preferredAdapterIp,
                packetVerboseEnabled: this.packetVerboseEnabled
            });

            this.availableAdapters = PacketSniffer.listAdapters();
            const devices = this.getCandidateDevices();
            if (devices.length === 0) {
                throw new Error('No active IPv4 network capture devices found.');
            }

            for (const deviceInfo of devices) {
                const deviceName = deviceInfo.device;
                if (!deviceName) {
                    continue;
                }

                try {
                    const cap = new Cap();
                    const buffer = Buffer.alloc(65535);
                    const linkType = cap.open(deviceName, this.filter, this.bufSize, buffer);
                    cap.setMinBytes && cap.setMinBytes(0);

                    const handle = {
                        cap,
                        buffer,
                        device: deviceName,
                        description: deviceInfo.description || deviceInfo.name || deviceName,
                        ip: deviceInfo.ip,
                        linkType,
                        packetHandler: (nbytes) => {
                            if (linkType !== 'ETHERNET') {
                                return;
                            }

                            this.packetCount += 1;
                            this.handleCapturedPacket(buffer, nbytes);
                        }
                    };

                    cap.on('packet', handle.packetHandler);
                    this.captureHandles.push(handle);
                    this.logger.info('capture_handle_opened', {
                        device: deviceName,
                        description: handle.description,
                        ip: handle.ip,
                        linkType
                    });
                } catch {
                    // Ignore interfaces that cannot be opened or filtered.
                    this.logger.warning('capture_handle_open_failed', {
                        device: deviceName,
                        description: deviceInfo.description || deviceInfo.name || deviceName,
                        ip: deviceInfo.ip
                    });
                }
            }

            if (this.captureHandles.length === 0) {
                throw new Error('Unable to open any active capture device with the Albion filter.');
            }

            this.running = true;
            this.packetCount = 0;
            this.decodedPacketCount = 0;
            this.relevantDecodedCount = 0;
            this.nodeState.clear();
            this.playerPosition = { x: 0, y: 0 };
            this.currentZoneInfo = null;
            this.currentPlayerName = null;
            this.playerEntityId = null;
            this.lastRequestedPlayerMove = null;
            this.moveCandidates.clear();
            this.observedPlayers.clear();
            this.worldEntities.clear();
            this.pendingWorldEntityUpserts.clear();
            this.pendingWorldEntityRemovals.clear();
            this.debugCounters.clear();
            this.decodedCodeCounts.clear();
            for (const key of Object.keys(this.statusCounts)) {
                this.statusCounts[key] = 0;
            }

            this.selectedAdapter = devices[0] || null;
            const activeDevices = this.captureHandles.map(handle => handle.description);

            this.logger.info('sniffer_started', {
                deviceCount: activeDevices.length,
                devices: activeDevices,
                selectedAdapter: this.selectedAdapter,
                filter: this.filter
            });
            this.broadcast({
                event: 'SNIFFER_STATUS',
                data: {
                    state: 'listening',
                    device: activeDevices.join(', '),
                    adapterIp: this.selectedAdapter?.ip ?? null,
                    adapterName: this.selectedAdapter?.name ?? null,
                    filter: this.filter,
                    capture: this.getCaptureMetadata(),
                    message: 'Live capture started. Listening for Albion traffic, movement, players, harvestables, mobs, and world objects.'
                }
            });

            this.statsInterval = setInterval(() => {
                this.broadcast({
                    event: 'SNIFFER_STATS',
                    data: {
                        state: 'listening',
                        device: activeDevices.join(', '),
                        adapterIp: this.selectedAdapter?.ip ?? null,
                        filter: this.filter,
                        packetsSeen: this.packetCount,
                        decodedPhotonPackets: this.decodedPacketCount,
                        relevantAlbionPackets: this.relevantDecodedCount,
                        trackedNodes: this.nodeState.size,
                        trackedPlayers: this.observedPlayers.size,
                        trackedWorldEntities: this.worldEntities.size,
                        trackedPlayerName: this.currentPlayerName,
                        trackedPlayerEntityId: this.playerEntityId,
                        decoder: 'protocol18-photon',
                        statusCounts: this.statusCounts
                    }
                });
            }, 1000);
            this.cleanupInterval = setInterval(() => {
                this.cleanupStaleWorldEntities();
            }, 15000);

            return { ok: true };
        } catch (error) {
            this.stop();
            this.logger.error('sniffer_start_failed', {
                error,
                filter: this.filter
            });
            this.broadcast({
                event: 'SNIFFER_STATUS',
                data: {
                    state: 'error',
                    filter: this.filter,
                    message: `Live capture failed to start: ${error.message}`
                }
            });
            return { ok: false, message: error.message };
        }
    }

    stop() {
        this.logger.info('sniffer_stopping', {
            packetCount: this.packetCount,
            decodedPacketCount: this.decodedPacketCount,
            relevantDecodedCount: this.relevantDecodedCount,
            trackedNodes: this.nodeState.size
        });
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        if (this.worldEntityFlushTimer) {
            clearTimeout(this.worldEntityFlushTimer);
            this.worldEntityFlushTimer = null;
        }

        for (const handle of this.captureHandles) {
            try {
                handle.cap.removeListener('packet', handle.packetHandler);
                handle.cap.close();
            } catch (error) {
                this.logger.warning('capture_handle_close_failed', {
                    device: handle.device,
                    error
                });
            }
        }

        this.captureHandles = [];
        this.running = false;
        this.packetCount = 0;
        this.decodedPacketCount = 0;
        this.relevantDecodedCount = 0;
        this.nodeState.clear();
        this.playerPosition = { x: 0, y: 0 };
        this.currentZoneInfo = null;
        this.currentPlayerName = null;
        this.playerEntityId = null;
        this.lastRequestedPlayerMove = null;
        this.moveCandidates.clear();
        this.availableAdapters = [];
        this.selectedAdapter = null;
        this.observedPlayers.clear();
        this.worldEntities.clear();
        this.pendingWorldEntityUpserts.clear();
        this.pendingWorldEntityRemovals.clear();
        this.debugCounters.clear();
        this.decodedCodeCounts.clear();
        this.logger.info('sniffer_stopped', {
            filter: this.filter
        });
    }

    getSnapshot() {
        return {
            mode: 'sniffer',
            nodes: Array.from(this.nodeState.values()),
            players: Array.from(this.observedPlayers.values()),
            worldEntities: Array.from(this.worldEntities.values()),
            playerPos: this.playerPosition,
            zoneInfo: this.currentZoneInfo,
            capture: this.getCaptureMetadata()
        };
    }

    getCandidateDevices() {
        if (!Array.isArray(this.availableAdapters) || this.availableAdapters.length === 0) {
            return [];
        }

        if (this.preferredAdapterIp) {
            const exactMatch = this.availableAdapters.find(adapter => adapter.ip === this.preferredAdapterIp);
            if (exactMatch) {
                return [exactMatch];
            }

            this.logger.warning('preferred_capture_adapter_missing', {
                preferredAdapterIp: this.preferredAdapterIp
            });
        }

        const ranked = this.availableAdapters
            .filter(adapter => !isLoopbackAddress(adapter.ip) && !isLinkLocalAddress(adapter.ip));
        if (ranked.length > 0) {
            return [ranked[0]];
        }

        return [this.availableAdapters[0]];
    }

    getCaptureMetadata() {
        return {
            preferredAdapterIp: this.preferredAdapterIp,
            selectedAdapter: this.selectedAdapter,
            adapters: this.availableAdapters
        };
    }

    handleCapturedPacket(buffer, nbytes) {
        let ret = decoders.Ethernet(buffer);
        if (ret.info.type !== PROTOCOL.ETHERNET.IPV4) {
            return;
        }

        ret = decoders.IPV4(buffer, ret.offset);
        if (ret.info.protocol !== PROTOCOL.IP.UDP) {
            return;
        }

        ret = decoders.UDP(buffer, ret.offset);
        const payload = buffer.slice(ret.offset, nbytes);
        if (this.packetVerboseEnabled) {
            this.logger.verbose('udp_packet_captured', {
                length: payload.length,
                previewHex: this.getPacketPreview(payload)
            });
        }
        this.parsePhotonPacket(payload);
    }

    parsePhotonPacket(payloadBuf) {
        try {
            const result = this.photonParser.receivePacket(payloadBuf);
            this.statusCounts[result.status] = (this.statusCounts[result.status] || 0) + 1;
            this.logger.debug('photon_packet_parsed', {
                status: result.status,
                packetCount: result.packets.length,
                payloadLength: payloadBuf.length,
                previewHex: this.packetVerboseEnabled ? this.getPacketPreview(payloadBuf) : undefined
            });

            for (const packet of result.packets) {
                this.decodedPacketCount += 1;
                const decoded = decodeAlbionPacket(packet);

                if (!decoded) {
                    this.logger.debug('albion_packet_skipped', {
                        kind: packet?.kind ?? null,
                        messageType: packet?.messageType ?? null,
                        payloadPreview: packet?.payloadPreview ?? null
                    });
                    continue;
                }

                if (decoded.relevant) {
                    this.relevantDecodedCount += 1;
                }

                this.logger.debug('albion_packet_decoded', this.buildPacketContext(packet, decoded, {
                    keys: decoded.keys ?? [],
                    parameters: this.packetVerboseEnabled ? this.summarizeValue(packet.parameters) : undefined
                }));

                this.handleAlbionPacket(packet, decoded);

                if (this.shouldBroadcastDecodedPacket(decoded)) {
                    this.broadcast({
                        event: 'ALBION_DECODED',
                        data: decoded
                    });
                }
            }
        } catch (error) {
            this.statusCounts.parser_error += 1;
            this.logger.error('photon_packet_parse_failed', {
                error,
                payloadLength: payloadBuf.length,
                previewHex: this.getPacketPreview(payloadBuf)
            });
            this.broadcast({
                event: 'SNIFFER_STATUS',
                data: {
                    state: 'parser_error',
                    filter: this.filter,
                    message: `Photon decode error: ${error.message}`
                }
            });
        }
    }

    handleAlbionPacket(packet, decoded) {
        if (decoded.kind === 'request' && (decoded.code === 21 || decoded.code === 22)) {
            const moveMatch = this.extractPlayerMoveRequest(packet.parameters);
            if (moveMatch) {
                const move = moveMatch.position;
                this.logger.debug('player_move_request_extracted', this.buildPacketContext(packet, decoded, {
                    position: move,
                    source: moveMatch.source,
                    shape: moveMatch.shape
                }));
                this.lastRequestedPlayerMove = {
                    ...move,
                    at: Date.now(),
                    source: moveMatch.source
                };
                this.broadcastPlayerMove(move, `request_${decoded.code}`, {
                    source: moveMatch.source,
                    shape: moveMatch.shape
                });
            } else {
                this.logger.debug('player_move_request_missing_position', this.buildPacketContext(packet, decoded, {
                    parameters: this.summarizeValue(packet.parameters)
                }));
            }
            return;
        }

        if (decoded.kind === 'response' && (decoded.code === 2 || decoded.code === 35 || decoded.code === 41)) {
            const previousPlayerName = this.currentPlayerName;
            this.nodeState.clear();
            this.observedPlayers.clear();
            this.worldEntities.clear();
            this.pendingWorldEntityUpserts.clear();
            this.pendingWorldEntityRemovals.clear();
            this.currentZoneInfo = null;
            this.playerEntityId = null;
            this.lastRequestedPlayerMove = null;
            this.moveCandidates.clear();

            if (decoded.code === 41) {
                const nextZoneId = typeof packet?.parameters?.[0] === 'string'
                    ? packet.parameters[0].trim()
                    : null;

                if (nextZoneId) {
                    this.updateZoneInfo({
                        zoneId: nextZoneId,
                        name: this.formatZoneName(nextZoneId)
                    });
                }

                this.logger.info('cluster_change_response_processed', this.buildPacketContext(packet, decoded, {
                    previousPlayerName,
                    nextZoneId
                }));
                this.broadcast({
                    event: 'MAP_RESET',
                    data: {
                        reason: decoded.name
                    }
                });
                this.broadcast({
                    event: 'PLAYER_LIST_RESET',
                    data: {
                        reason: decoded.name
                    }
                });
                return;
            }

            const joinInfo = this.extractPlayerJoinInfo(packet.parameters);
            this.logger.info('join_response_processed', this.buildPacketContext(packet, decoded, {
                previousPlayerName,
                joinInfo: this.summarizeValue(joinInfo)
            }));
            this.currentPlayerName = joinInfo?.name || previousPlayerName || null;
            if (isFiniteNumber(joinInfo?.entityId)) {
                this.bindPlayerEntity(joinInfo.entityId, 'join_response', {
                    playerName: this.currentPlayerName,
                    joinPosition: joinInfo?.position ?? null
                });
            }
            if (joinInfo?.position) {
                this.broadcastPlayerMove(joinInfo.position, 'join_response', {
                    source: joinInfo.positionSource ?? null
                });
            }
            this.emitDebug('join_info', {
                responseCode: decoded.code,
                previousPlayerName,
                playerName: joinInfo?.name ?? null,
                trackedPlayerName: this.currentPlayerName,
                playerEntityId: joinInfo?.entityId ?? null,
                trackedPlayerEntityId: this.playerEntityId,
                joinPosition: joinInfo?.position ?? null
            }, 8);
            this.broadcast({
                event: 'MAP_RESET',
                data: {
                    reason: decoded.name
                }
            });
            this.broadcast({
                event: 'PLAYER_LIST_RESET',
                data: {
                    reason: decoded.name
                }
            });
            return;
        }

        if (decoded.kind !== 'event') {
            this.logger.debug('non_event_packet_ignored', this.buildPacketContext(packet, decoded));
            return;
        }

        if (decoded.code === 3) {
            const entityId = this.coerceNumber(packet?.parameters?.[0]);
            const position = this.extractMoveEventPosition(packet.parameters);

            if (!position || !isFiniteNumber(entityId)) {
                this.logger.debug('move_event_ignored', this.buildPacketContext(packet, decoded, {
                    entityId,
                    position,
                    parameters: this.summarizeValue(packet.parameters)
                }));
                return;
            }

            this.maybeIdentifyPlayerEntity(entityId, position);
            this.considerAutoBindFromMovement(entityId, position);

            if (this.playerEntityId !== null && entityId === this.playerEntityId) {
                this.broadcastPlayerMove(position, 'event_3', {
                    entityId
                });
            } else if (this.observedPlayers.has(String(entityId))) {
                this.upsertObservedPlayer({
                    id: String(entityId),
                    position
                }, 'movement');
            } else {
                this.logger.debug('move_event_not_bound_to_player', this.buildPacketContext(packet, decoded, {
                    entityId,
                    trackedPlayerEntityId: this.playerEntityId,
                    position
                }));
            }

            this.emitDebug('move_seen', {
                entityId,
                position,
                trackedPlayerEntityId: this.playerEntityId,
                currentPlayerName: this.currentPlayerName
            }, 6);

            return;
        }

        if (decoded.code === 29) {
            this.maybeIdentifyPlayerCharacter(packet.parameters);
            this.handleObservedPlayer(packet.parameters);
            this.emitDebug('new_character', {
                entityId: this.coerceNumber(packet?.parameters?.[0]),
                name: typeof packet?.parameters?.[1] === 'string' ? packet.parameters[1] : null,
                currentPlayerName: this.currentPlayerName,
                trackedPlayerEntityId: this.playerEntityId
            }, 12);
            return;
        }

        if (decoded.code === 1) {
            const entityId = this.coerceNumber(packet?.parameters?.[0]);
            if (isFiniteNumber(entityId)) {
                this.removeObservedPlayer(String(entityId), 'leave_event');
                this.removeWorldEntityById(entityId, ['mob', 'mist', 'wisp', 'cage', 'fishing'], 'leave_event');
            }
            return;
        }

        if (decoded.code === 140) {
            const zoneInfo = this.extractClusterInfo(packet.parameters);
            if (zoneInfo) {
                this.logger.debug('cluster_info_extracted', this.buildPacketContext(packet, decoded, {
                    zoneInfo
                }));
                this.updateZoneInfo(zoneInfo);
            } else {
                this.logger.debug('cluster_info_ignored', this.buildPacketContext(packet, decoded, {
                    parameters: this.summarizeValue(packet.parameters)
                }));
            }
            return;
        }

        if (decoded.code === 59 || decoded.code === 60 || decoded.code === 61) {
            this.considerAutoBindFromActorEvent(packet.parameters, decoded.code);
            return;
        }

        if (decoded.code === 6 || decoded.code === 7 || decoded.code === 91) {
            this.applyMobHealthState(packet.parameters, decoded.code);
            return;
        }

        if (decoded.code === 39) {
            const nodes = this.extractBulkHarvestableNodes(packet.parameters);
            for (const node of nodes) {
                this.upsertNode(node);
            }
            this.emitDebug('bulk_harvestables', {
                count: nodes.length,
                sample: nodes.slice(0, 5),
                rawIds: Array.isArray(packet?.parameters?.[0]) ? packet.parameters[0].slice(0, 5) : [],
                rawCharges: Array.isArray(packet?.parameters?.[1]) ? packet.parameters[1].slice(0, 5) : [],
                rawTiers: Array.isArray(packet?.parameters?.[2]) ? packet.parameters[2].slice(0, 5) : [],
                rawTypes: Array.isArray(packet?.parameters?.[4]) ? packet.parameters[4].slice(0, 5) : []
            }, 10);
            return;
        }

        if (decoded.code === 40) {
            const node = this.extractHarvestableNode(packet.parameters);
            if (node) {
                this.upsertNode(node);
            }
            this.emitDebug('single_harvestable', {
                node,
                rawPosition: packet?.parameters?.[8] ?? null,
                rawType: packet?.parameters?.[5] ?? null,
                rawTier: packet?.parameters?.[7] ?? null,
                rawCharges: packet?.parameters?.[10] ?? null,
                rawEnchant: packet?.parameters?.[11] ?? null
            }, 12);
            return;
        }

        if (decoded.code === 46) {
            this.logger.debug('harvestable_state_change_received', this.buildPacketContext(packet, decoded, {
                parameters: this.summarizeValue(packet.parameters)
            }));
            this.applyHarvestableStateChange(packet.parameters);
            return;
        }

        if (decoded.code === 123) {
            const worldEntity = extractMobEntity(packet.parameters, this.mobCatalog);
            if (worldEntity) {
                this.upsertWorldEntity(worldEntity, 'new_mob');
            }
            return;
        }

        if (decoded.code === 323) {
            const worldEntity = extractDungeonEntity(packet.parameters);
            if (worldEntity) {
                this.upsertWorldEntity(worldEntity, 'new_dungeon');
            }
            return;
        }

        if (decoded.code === 391) {
            const worldEntity = extractChestEntity(packet.parameters);
            if (worldEntity) {
                this.upsertWorldEntity(worldEntity, 'new_chest');
            }
            return;
        }

        if (decoded.code === 359) {
            const worldEntity = extractFishingEntity(packet.parameters);
            if (worldEntity) {
                this.upsertWorldEntity(worldEntity, 'new_fishing_zone');
            }
            return;
        }

        if (decoded.code === 356) {
            this.removeWorldEntityById(packet?.parameters?.[0], ['fishing'], 'fishing_finished');
            return;
        }

        if (decoded.code === 530) {
            const worldEntity = extractCageEntity(packet.parameters);
            if (worldEntity) {
                this.upsertWorldEntity(worldEntity, 'new_cage');
            }
            return;
        }

        if (decoded.code === 531) {
            this.removeWorldEntityById(packet?.parameters?.[0], ['cage'], 'cage_state_updated');
            return;
        }

        if (decoded.code === 523) {
            const worldEntity = extractWispEntity(packet.parameters);
            if (worldEntity) {
                this.upsertWorldEntity(worldEntity, 'new_mists_wisp');
            }
            return;
        }

        if (decoded.code === 524) {
            const worldEntity = extractWispEntity(packet.parameters);
            if (worldEntity) {
                this.upsertWorldEntity(worldEntity, 'mists_wisp_state_change');
            } else {
                this.removeWorldEntityById(packet?.parameters?.[0], ['wisp'], 'mists_wisp_state_change');
            }
        }
    }

    handleObservedPlayer(parameters) {
        const player = this.extractObservedPlayer(parameters);
        if (!player) {
            return;
        }

        this.upsertObservedPlayer(player, 'new_character');
    }

    maybeIdentifyPlayerEntity(entityId, position) {
        if (this.playerEntityId === entityId) {
            return;
        }

        const joinDx = Math.abs(this.playerPosition.x - position.x);
        const joinDy = Math.abs(this.playerPosition.y - position.y);
        if (this.currentPlayerName && joinDx <= 1.5 && joinDy <= 1.5) {
            this.bindPlayerEntity(entityId, 'join_proximity', {
                position,
                playerPosition: this.playerPosition,
                currentPlayerName: this.currentPlayerName
            });
            this.emitDebug('player_bound_from_join', {
                entityId,
                position,
                playerPosition: this.playerPosition,
                currentPlayerName: this.currentPlayerName
            }, 6);
            return;
        }

        if (!this.lastRequestedPlayerMove) {
            return;
        }

        if (Date.now() - this.lastRequestedPlayerMove.at > 3000) {
            return;
        }

        const dx = Math.abs(this.lastRequestedPlayerMove.x - position.x);
        const dy = Math.abs(this.lastRequestedPlayerMove.y - position.y);
        if (dx <= 0.8 && dy <= 0.8) {
            this.bindPlayerEntity(entityId, 'move_request_match', {
                position,
                requestPosition: this.lastRequestedPlayerMove
            });
            this.emitDebug('player_bound_from_request', {
                entityId,
                position,
                requestPosition: this.lastRequestedPlayerMove
            }, 6);
        }
    }

    maybeIdentifyPlayerCharacter(parameters) {
        const entityId = this.coerceNumber(parameters?.[0]);
        const name = typeof parameters?.[1] === 'string' ? parameters[1] : null;

        if (!name || !this.currentPlayerName || name !== this.currentPlayerName || !isFiniteNumber(entityId)) {
            return;
        }

        this.bindPlayerEntity(entityId, 'character_name_match', {
            name,
            currentPlayerName: this.currentPlayerName
        });
        this.emitDebug('player_bound_from_name', {
            entityId,
            name,
            currentPlayerName: this.currentPlayerName
        }, 6);
    }

    considerAutoBindFromActorEvent(parameters, code) {
        if (!this.currentPlayerName || this.playerEntityId !== null) {
            return;
        }

        const actorId = this.coerceNumber(parameters?.[0]);
        if (!isFiniteNumber(actorId)) {
            return;
        }

        const candidate = this.moveCandidates.get(actorId);
        if (!candidate || candidate.count < 2) {
            return;
        }

        this.bindPlayerEntity(actorId, 'actor_event_match', {
            eventCode: code,
            candidateCount: candidate.count,
            lastPosition: candidate.lastPosition ?? null
        });
        this.emitDebug('player_bound_from_actor', {
            entityId: actorId,
            eventCode: code,
            candidateCount: candidate.count,
            lastPosition: candidate.lastPosition ?? null
        }, 6);
    }

    considerAutoBindFromMovement(entityId, position) {
        if (!this.currentPlayerName || this.playerEntityId !== null) {
            return;
        }

        const now = Date.now();
        const existing = this.moveCandidates.get(entityId);
        const count = existing && now - existing.lastSeen < 3500 ? existing.count + 1 : 1;
        this.moveCandidates.set(entityId, {
            count,
            lastSeen: now,
            lastPosition: position
        });

        for (const [candidateId, candidate] of this.moveCandidates.entries()) {
            if (now - candidate.lastSeen > 6000) {
                this.moveCandidates.delete(candidateId);
            }
        }

        if (this.moveCandidates.size === 0) {
            return;
        }

        const ranked = Array.from(this.moveCandidates.entries())
            .map(([candidateId, candidate]) => ({
                entityId: candidateId,
                count: candidate.count,
                lastSeen: candidate.lastSeen,
                lastPosition: candidate.lastPosition
            }))
            .sort((left, right) => {
                if (right.count !== left.count) {
                    return right.count - left.count;
                }

                return right.lastSeen - left.lastSeen;
            });

        const top = ranked[0];
        const second = ranked[1];

        if (!top || top.count < 4) {
            return;
        }

        if (second && top.count < second.count + 2) {
            return;
        }

        this.bindPlayerEntity(top.entityId, 'movement_activity', {
            topCandidate: top,
            secondCandidate: second ?? null
        });
        this.emitDebug('player_bound_from_activity', {
            entityId: top.entityId,
            topCandidate: top,
            secondCandidate: second ?? null
        }, 6);
    }

    bindPlayerEntity(entityId, source, extra = null) {
        if (!isFiniteNumber(entityId)) {
            return;
        }

        this.playerEntityId = entityId;
        this.emitDebug('player_entity_bound', {
            entityId,
            source,
            currentPlayerName: this.currentPlayerName,
            extra
        }, 10);
    }

    applyMobHealthState(parameters, code) {
        const healthState = extractHealthState(parameters);
        if (!healthState?.id) {
            return;
        }

        const existingMob = this.worldEntities.get(createWorldEntityKey('mob', healthState.id));
        if (!existingMob) {
            return;
        }

        if (code === 6 && (healthState.currentHealth === null || healthState.currentHealth <= 0)) {
            this.removeWorldEntityById(healthState.id, ['mob'], 'mob_health_zero');
            return;
        }

        const nextHealthPercent = healthState.normalizedHealth !== null
            ? Math.round((healthState.normalizedHealth / 255) * 100)
            : existingMob.healthPercent;

        this.upsertWorldEntity({
            ...existingMob,
            healthPercent: nextHealthPercent,
            currentHealth: healthState.currentHealth ?? existingMob.currentHealth ?? null
        }, 'mob_health_update');
    }

    upsertWorldEntity(entity, source = 'unknown') {
        if (!entity?.uid || !entity?.kind || !entity?.position) {
            return;
        }

        const normalizedPosition = this.validatePosition(entity.position);
        if (!normalizedPosition) {
            return;
        }

        const existing = this.worldEntities.get(entity.uid);
        const next = {
            ...existing,
            ...entity,
            position: normalizedPosition,
            uid: entity.uid,
            id: String(entity.id),
            kind: entity.kind,
            lastSeenAt: Date.now()
        };

        this.worldEntities.set(next.uid, next);
        this.pendingWorldEntityUpserts.set(next.uid, next);
        this.pendingWorldEntityRemovals.delete(next.uid);
        this.scheduleWorldEntityFlush();
        this.logger.debug('world_entity_upserted', {
            source,
            uid: next.uid,
            kind: next.kind,
            label: next.label,
            trackedWorldEntities: this.worldEntities.size
        });
    }

    removeWorldEntityById(id, kinds, source = 'unknown') {
        const rawId = this.coerceNumber(id);
        if (!isFiniteNumber(rawId)) {
            return;
        }

        for (const kind of kinds) {
            this.removeWorldEntity(createWorldEntityKey(kind, rawId), source);
        }
    }

    removeWorldEntity(uid, source = 'unknown') {
        if (!uid || !this.worldEntities.has(uid)) {
            return;
        }

        this.worldEntities.delete(uid);
        this.pendingWorldEntityUpserts.delete(uid);
        this.pendingWorldEntityRemovals.add(uid);
        this.scheduleWorldEntityFlush();
        this.logger.debug('world_entity_removed', {
            source,
            uid,
            trackedWorldEntities: this.worldEntities.size
        });
    }

    scheduleWorldEntityFlush() {
        if (this.worldEntityFlushTimer) {
            return;
        }

        this.worldEntityFlushTimer = setTimeout(() => {
            this.worldEntityFlushTimer = null;
            this.flushWorldEntityPatch();
        }, 100);
    }

    flushWorldEntityPatch() {
        if (this.pendingWorldEntityUpserts.size === 0 && this.pendingWorldEntityRemovals.size === 0) {
            return;
        }

        this.broadcast({
            event: 'WORLD_ENTITIES_PATCH',
            data: {
                upserts: Array.from(this.pendingWorldEntityUpserts.values()),
                removals: Array.from(this.pendingWorldEntityRemovals.values())
            }
        });

        this.pendingWorldEntityUpserts.clear();
        this.pendingWorldEntityRemovals.clear();
    }

    cleanupStaleWorldEntities() {
        const now = Date.now();
        for (const entity of this.worldEntities.values()) {
            const ttlMs = Number.isFinite(entity.ttlMs) ? entity.ttlMs : 180000;
            if ((now - (entity.lastSeenAt || now)) > ttlMs) {
                this.removeWorldEntity(entity.uid, 'stale_cleanup');
            }
        }
    }

    summarizeValue(value, depth = 0) {
        if (value === null || value === undefined) {
            return value ?? null;
        }

        if (depth > 3) {
            if (Array.isArray(value)) {
                return `[array:${value.length}]`;
            }

            if (Buffer.isBuffer(value)) {
                return `[buffer:${value.length}]`;
            }

            if (typeof value === 'object') {
                return `[object:${Object.keys(value).length}]`;
            }
        }

        if (Buffer.isBuffer(value)) {
            return {
                type: 'buffer',
                length: value.length,
                hex: value.subarray(0, 24).toString('hex')
            };
        }

        if (Array.isArray(value)) {
            return value.slice(0, 10).map(item => this.summarizeValue(item, depth + 1));
        }

        if (typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).slice(0, 12).map(([key, nested]) => [key, this.summarizeValue(nested, depth + 1)])
            );
        }

        return value;
    }

    getPacketPreview(payloadBuf, bytes = 64) {
        return Buffer.from(payloadBuf).subarray(0, bytes).toString('hex');
    }

    buildPacketContext(packet, decoded, extra = {}) {
        return {
            packetKind: packet?.kind ?? null,
            packetCode: decoded?.code ?? packet?.code ?? packet?.operationCode ?? null,
            packetName: decoded?.name ?? null,
            relevant: decoded?.relevant ?? null,
            signalByte: packet?.signalByte ?? null,
            messageType: packet?.messageType ?? null,
            ...extra
        };
    }

    updateZoneInfo(zoneInfo) {
        if (!zoneInfo || (!zoneInfo.name && !zoneInfo.zoneId)) {
            this.logger.debug('zone_info_update_skipped', { reason: 'missing_zone_identity' });
            return;
        }

        const previousZoneInfo = this.currentZoneInfo;

        const nextZoneInfo = this.zoneCatalog.enrichZone({
            zoneId: zoneInfo.zoneId || this.toZoneId(zoneInfo.name) || null,
            name: zoneInfo.name || zoneInfo.zoneId,
            mapSize: Number.isInteger(zoneInfo.mapSize) && zoneInfo.mapSize > 0 ? zoneInfo.mapSize : 1000
        });

        const hasChanged = !previousZoneInfo
            || previousZoneInfo.zoneId !== nextZoneInfo.zoneId
            || previousZoneInfo.name !== nextZoneInfo.name
            || previousZoneInfo.mapSize !== nextZoneInfo.mapSize;

        this.currentZoneInfo = nextZoneInfo;
        this.logger.info('zone_info_updated', {
            previousZoneInfo: previousZoneInfo,
            nextZoneInfo,
            hasChanged
        });

        if (hasChanged) {
            this.observedPlayers.clear();
            this.worldEntities.clear();
            this.pendingWorldEntityUpserts.clear();
            this.pendingWorldEntityRemovals.clear();
            this.broadcast({
                event: 'ZONE_ENTER',
                data: nextZoneInfo
            });
            this.broadcast({
                event: 'PLAYER_LIST_RESET',
                data: {
                    reason: 'zone_changed',
                    zoneInfo: nextZoneInfo
                }
            });
            this.broadcast({
                event: 'MAP_RESET',
                data: {
                    reason: 'zone_changed',
                    zoneInfo: nextZoneInfo
                }
            });
        }
    }

    getThreatStatus(flagId) {
        if (flagId === 255) {
            return 'hostile';
        }

        if (flagId >= 1 && flagId <= 6) {
            return 'faction';
        }

        return 'passive';
    }

    extractObservedPlayer(parameters) {
        const entityId = this.coerceNumber(parameters?.[0]);
        const name = typeof parameters?.[1] === 'string' ? parameters[1].trim() : '';

        if (!isFiniteNumber(entityId) || !name || name === this.currentPlayerName) {
            return null;
        }

        if (this.playerEntityId !== null && entityId === this.playerEntityId) {
            return null;
        }

        const positionMatch = this.findPositionCandidate(parameters?.[9], 'parameters.9')
            || this.findPositionCandidate(parameters?.[8], 'parameters.8')
            || this.findPositionCandidate(parameters, 'parameters');
        const flagId = this.coerceNumber(parameters?.[53], 0);

        return {
            id: String(entityId),
            name,
            guildName: typeof parameters?.[8] === 'string' ? parameters[8] : '',
            allianceName: typeof parameters?.[51] === 'string' ? parameters[51] : '',
            flagId,
            threat: this.getThreatStatus(flagId),
            position: positionMatch?.position ?? null,
            lastSeenAt: Date.now()
        };
    }

    extractCoordinateObject(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value) || Buffer.isBuffer(value)) {
            return null;
        }

        const candidatePairs = [
            [value.x, value.y],
            [value.X, value.Y],
            [value.posX ?? value.posx, value.posY ?? value.posy],
            [value.worldX ?? value.worldx, value.worldY ?? value.worldy],
            [value[0], value[1]],
            // Some packets might pass array position explicitly or via z-axis logic
            [value.x, value.z],
            [value.X, value.Z],
            [value.posX ?? value.posx, value.posZ ?? value.posz]
        ];

        for (const [rawX, rawY] of candidatePairs) {
            if (rawX === undefined || rawY === undefined) {
                continue;
            }

            const position = this.validatePosition({
                x: this.normalizeCoordinateNumber(rawX),
                y: this.normalizeCoordinateNumber(rawY)
            });

            if (position) {
                return position;
            }
        }

        return null;
    }

    findPositionCandidate(value, path = 'value', depth = 0) {
        if (depth > 3 || value === null || value === undefined) {
            return null;
        }

        const arrayPosition = this.extractCoordinateArray(value);
        if (arrayPosition) {
            return {
                position: arrayPosition,
                source: path,
                shape: 'array'
            };
        }

        const objectPosition = this.extractCoordinateObject(value);
        if (objectPosition) {
            return {
                position: objectPosition,
                source: path,
                shape: 'object'
            };
        }

        if (Array.isArray(value)) {
            for (let index = 0; index < Math.min(value.length, 8); index += 1) {
                const nested = this.findPositionCandidate(value[index], `${path}[${index}]`, depth + 1);
                if (nested) {
                    return nested;
                }
            }
            return null;
        }

        if (typeof value === 'object' && !Buffer.isBuffer(value)) {
            for (const [key, nestedValue] of Object.entries(value).slice(0, 12)) {
                const nested = this.findPositionCandidate(nestedValue, `${path}.${key}`, depth + 1);
                if (nested) {
                    return nested;
                }
            }
        }

        return null;
    }

    extractPlayerMoveRequest(parameters) {
        const fixtureMatch = extractPlayerMoveRequestFixture(parameters);
        if (fixtureMatch) {
            return fixtureMatch;
        }

        if (!parameters || typeof parameters !== 'object') {
            return null;
        }

        const preferredKeys = [1, 2, 0, 3, 4];
        for (const key of preferredKeys) {
            const match = this.findPositionCandidate(parameters[key], `parameters.${key}`);
            if (match) {
                return match;
            }
        }

        return null;
    }

    extractPlayerJoinInfo(parameters) {
        const fixtureInfo = extractPlayerJoinInfoFixture(parameters);
        if (fixtureInfo?.position) {
            return fixtureInfo;
        }

        if (!parameters || typeof parameters !== 'object') {
            return null;
        }

        const entityId = this.coerceNumber(parameters[0]);
        const name = typeof parameters[2] === 'string' ? parameters[2] : null;
        const positionMatch = this.findPositionCandidate(parameters[9], 'parameters.9')
            || this.findPositionCandidate(parameters[8], 'parameters.8')
            || this.findPositionCandidate(parameters, 'parameters');

        return {
            entityId,
            name,
            position: positionMatch?.position ?? null,
            positionSource: positionMatch?.source ?? null
        };
    }

    extractClusterInfo(parameters) {
        const strings = [];
        const numbers = [];
        this.collectScalarCandidates(parameters, strings, numbers);

        const filteredStrings = strings.filter(value => value && value !== this.currentPlayerName);
        const preferredName = filteredStrings.find(value => value.includes(' '))
            || filteredStrings.find(value => /[A-Za-z]/.test(value));
        const zoneId = filteredStrings.find(value => /^[A-Z0-9_:-]{4,}$/.test(value))
            || filteredStrings.find(value => /^[A-Za-z0-9_-]{4,}$/.test(value));
        const mapSize = numbers.find(value => Number.isInteger(value) && value >= 100 && value <= 5000) || 1000;

        if (!preferredName && !zoneId) {
            return null;
        }

        return {
            zoneId: zoneId || this.toZoneId(preferredName),
            name: preferredName || this.formatZoneName(zoneId) || zoneId,
            mapSize
        };
    }

    extractMoveEventPosition(parameters) {
        const moveBuffer = this.toByteBuffer(parameters?.[1]);
        if (!moveBuffer) {
            const fallbackMatch = this.findPositionCandidate(parameters?.[1], 'parameters.1')
                || this.findPositionCandidate(parameters?.[2], 'parameters.2');
            return fallbackMatch?.position ?? null;
        }

        if (moveBuffer.length >= BYTE_MOVE_LONG_LENGTH) {
            return this.validatePosition({
                x: moveBuffer.readFloatLE(13),
                y: moveBuffer.readFloatLE(26)
            });
        }

        if (moveBuffer.length >= BYTE_MOVE_SHORT_LENGTH) {
            return this.validatePosition({
                x: moveBuffer.readFloatLE(13),
                y: moveBuffer.readFloatLE(18)
            });
        }

        return null;
    }

    collectScalarCandidates(value, strings, numbers, depth = 0) {
        if (depth > 3 || value === null || value === undefined) {
            return;
        }

        if (typeof value === 'string') {
            const normalized = value.trim();
            if (normalized) {
                strings.push(normalized);
            }
            return;
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            numbers.push(value);
            return;
        }

        if (Buffer.isBuffer(value)) {
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value.slice(0, 16)) {
                this.collectScalarCandidates(item, strings, numbers, depth + 1);
            }
            return;
        }

        if (typeof value === 'object') {
            for (const nested of Object.values(value).slice(0, 16)) {
                this.collectScalarCandidates(nested, strings, numbers, depth + 1);
            }
        }
    }

    extractHarvestableNode(parameters) {
        const id = this.coerceNumber(parameters?.[0]);
        const typeId = this.coerceNumber(parameters?.[5]);
        const tier = this.coerceNumber(parameters?.[7]);
        const position = this.extractCoordinateArray(parameters?.[8]);

        if (!isFiniteNumber(id) || !isFiniteNumber(typeId) || !isFiniteNumber(tier) || !position) {
            return null;
        }

        const type = this.mapHarvestableType(typeId);
        if (!type) {
            return null;
        }

        return {
            id: String(id),
            x: position.x.toFixed(2),
            y: position.y.toFixed(2),
            type,
            tier,
            enchant: this.coerceNumber(parameters?.[11], 0),
            charges: Math.max(0, this.coerceNumber(parameters?.[10], 0))
        };
    }

    extractBulkHarvestableNodes(parameters) {
        const ids = Array.isArray(parameters?.[0]) ? parameters[0] : [];
        const charges = Array.isArray(parameters?.[1]) ? parameters[1] : [];
        const tiers = Array.isArray(parameters?.[2]) ? parameters[2] : [];
        const coords = Array.isArray(parameters?.[3]) ? parameters[3] : [];
        const typeIds = Array.isArray(parameters?.[4]) ? parameters[4] : [];

        if (ids.length === 0 || coords.length < ids.length * 2) {
            return [];
        }

        const nodes = [];

        for (let index = 0; index < ids.length; index += 1) {
            const id = this.coerceNumber(ids[index]);
            const typeId = this.coerceNumber(typeIds[index]);
            const tier = this.coerceNumber(tiers[index]);
            const nodeCharges = Math.max(0, this.coerceNumber(charges[index], 0));
            const position = this.validatePosition({
                x: this.normalizeCoordinateNumber(coords[index * 2]),
                y: this.normalizeCoordinateNumber(coords[index * 2 + 1])
            });

            if (!isFiniteNumber(id) || !isFiniteNumber(typeId) || !isFiniteNumber(tier) || !position) {
                continue;
            }

            const type = this.mapHarvestableType(typeId);
            if (!type || nodeCharges <= 0) {
                continue;
            }

            nodes.push({
                id: String(id),
                x: position.x.toFixed(2),
                y: position.y.toFixed(2),
                type,
                tier,
                enchant: 0,
                charges: nodeCharges
            });
        }

        return nodes;
    }

    applyHarvestableStateChange(parameters) {
        const id = String(this.coerceNumber(parameters?.[0]));
        if (!id || id === 'NaN') {
            this.logger.debug('harvestable_state_change_invalid_id', {
                parameters: this.summarizeValue(parameters)
            });
            return;
        }

        const hasState = Object.prototype.hasOwnProperty.call(parameters || {}, 1);
        if (!hasState) {
            this.logger.debug('harvestable_state_change_remove_without_state', { nodeId: id });
            this.removeNode(id);
            return;
        }

        const existing = this.nodeState.get(id);
        if (!existing) {
            this.logger.debug('harvestable_state_change_missing_existing_node', { nodeId: id });
            return;
        }

        const charges = Math.max(0, this.coerceNumber(parameters?.[1], existing.charges ?? 0));
        if (charges <= 0) {
            this.logger.debug('harvestable_state_change_remove_depleted', { nodeId: id, charges });
            this.removeNode(id);
            return;
        }

        this.upsertNode({
            ...existing,
            charges
        });
    }

    upsertNode(node) {
        if (!node || node.charges <= 0) {
            this.logger.debug('node_upsert_rejected', {
                node: this.summarizeValue(node)
            });
            this.removeNode(node?.id);
            return;
        }

        this.nodeState.set(node.id, node);
        this.logger.debug('node_upserted', {
            nodeId: node.id,
            type: node.type,
            tier: node.tier,
            enchant: node.enchant,
            charges: node.charges,
            x: node.x,
            y: node.y,
            trackedNodes: this.nodeState.size
        });
        this.broadcast({
            event: 'NEW_NODE',
            data: node
        });
    }

    upsertObservedPlayer(player, source = 'unknown') {
        if (!player?.id) {
            return;
        }

        const existing = this.observedPlayers.get(player.id);
        const next = {
            id: player.id,
            name: player.name ?? existing?.name ?? 'Unknown',
            guildName: player.guildName ?? existing?.guildName ?? '',
            allianceName: player.allianceName ?? existing?.allianceName ?? '',
            flagId: isFiniteNumber(player.flagId) ? player.flagId : (existing?.flagId ?? 0),
            threat: player.threat ?? existing?.threat ?? this.getThreatStatus(player.flagId ?? existing?.flagId ?? 0),
            position: player.position ?? existing?.position ?? null,
            lastSeenAt: player.lastSeenAt ?? Date.now()
        };

        this.observedPlayers.set(player.id, next);
        this.logger.debug('observed_player_upserted', {
            source,
            playerId: next.id,
            name: next.name,
            threat: next.threat,
            hasPosition: Boolean(next.position),
            trackedPlayers: this.observedPlayers.size
        });

        this.broadcast({
            event: 'PLAYER_SPOTTED',
            data: next
        });

        const becameHostile = next.threat === 'hostile' && existing?.threat !== 'hostile';
        if (becameHostile) {
            this.broadcast({
                event: 'HOSTILE_ALERT',
                data: {
                    id: next.id,
                    name: next.name,
                    guildName: next.guildName,
                    allianceName: next.allianceName,
                    flagId: next.flagId,
                    zoneInfo: this.currentZoneInfo
                }
            });
        }
    }

    removeObservedPlayer(id, source = 'unknown') {
        if (!id || !this.observedPlayers.has(id)) {
            return;
        }

        const existing = this.observedPlayers.get(id);
        this.observedPlayers.delete(id);
        this.logger.debug('observed_player_removed', {
            source,
            playerId: id,
            name: existing?.name ?? null,
            trackedPlayers: this.observedPlayers.size
        });
        this.broadcast({
            event: 'PLAYER_LEFT',
            data: { id }
        });
    }

    removeNode(id) {
        if (!this.nodeState.has(id)) {
            this.logger.debug('node_remove_noop', { nodeId: id });
            return;
        }

        this.nodeState.delete(id);
        this.logger.debug('node_removed', {
            nodeId: id,
            trackedNodes: this.nodeState.size
        });
        this.broadcast({
            event: 'REMOVE_NODE',
            data: { id }
        });
    }

    broadcastPlayerMove(position, source = 'unknown', extra = null) {
        this.playerPosition = {
            x: Number(position.x.toFixed(6)),
            y: Number(position.y.toFixed(6))
        };
        this.logger.debug('player_move_broadcast', {
            position: this.playerPosition,
            source,
            extra,
            trackedPlayerEntityId: this.playerEntityId,
            trackedPlayerName: this.currentPlayerName
        });
        this.broadcast({
            event: 'PLAYER_MOVE',
            data: this.playerPosition
        });
    }

    validatePosition(position) {
        if (!position || !isFiniteNumber(position.x) || !isFiniteNumber(position.y)) {
            return null;
        }

        if (Math.abs(position.x) > 100000 || Math.abs(position.y) > 100000) {
            return null;
        }

        return position;
    }

    normalizeCoordinateNumber(value) {
        const numeric = this.coerceNumber(value);
        if (!isFiniteNumber(numeric)) {
            return Number.NaN;
        }

        const abs = Math.abs(numeric);
        if (abs === 0) {
            return 0;
        }

        if (abs < 1e-20 || abs > 100000) {
            const reversed = reverseFloat32Endian(numeric);
            if (isFiniteNumber(reversed) && Math.abs(reversed) <= 100000) {
                return reversed;
            }
        }

        return numeric;
    }

    extractCoordinateArray(value) {
        if (!Array.isArray(value) || value.length < 2) {
            return null;
        }

        const looksLikeByteArray = value.length > 4
            && value.every(item => Number.isInteger(item) && item >= 0 && item <= 255);
        if (looksLikeByteArray) {
            return null;
        }

        const x = this.normalizeCoordinateNumber(value[0]);
        const y = this.normalizeCoordinateNumber(value[1]);
        return this.validatePosition({ x, y });
    }

    toByteBuffer(value) {
        if (Buffer.isBuffer(value)) {
            return value;
        }

        if (!Array.isArray(value) || value.length === 0) {
            return null;
        }

        const bytes = value.filter(item => Number.isInteger(item) && item >= 0 && item <= 255);
        if (bytes.length !== value.length) {
            return null;
        }

        return Buffer.from(bytes);
    }

    toZoneId(value) {
        if (typeof value !== 'string' || value.trim() === '') {
            return null;
        }

        return value
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^A-Za-z0-9_-]/g, '')
            .toLowerCase();
    }

    formatZoneName(value) {
        if (typeof value !== 'string' || value.trim() === '') {
            return null;
        }

        if (value.includes(' ')) {
            return value;
        }

        return value
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    coerceNumber(value, fallback = Number.NaN) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string' && value.trim() !== '') {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : fallback;
        }

        return fallback;
    }

    mapHarvestableType(typeId) {
        if (typeId >= 0 && typeId <= 5) {
            return 'wood';
        }

        if (typeId >= 6 && typeId <= 10) {
            return 'stone';
        }

        if (typeId >= 11 && typeId <= 15) {
            return 'fiber';
        }

        if (typeId >= 16 && typeId <= 22) {
            return 'hide';
        }

        if (typeId >= 23 && typeId <= 27) {
            return 'ore';
        }

        return null;
    }

    shouldBroadcastDecodedPacket(decoded) {
        const counterKey = `${decoded.kind}:${decoded.code}`;
        const currentCount = (this.decodedCodeCounts.get(counterKey) || 0) + 1;
        this.decodedCodeCounts.set(counterKey, currentCount);

        if (currentCount <= 3) {
            return true;
        }

        if (decoded.kind === 'request' && (decoded.code === 21 || decoded.code === 22)) {
            return currentCount % 10 === 0;
        }

        if (decoded.code === 3) {
            return currentCount % 50 === 0;
        }

        return decoded.relevant && currentCount % 20 === 0;
    }

    emitDebug(kind, data, limit = 10) {
        const currentCount = (this.debugCounters.get(kind) || 0) + 1;
        this.debugCounters.set(kind, currentCount);

        if (currentCount > limit) {
            return;
        }

        this.broadcast({
            event: 'SNIFFER_DEBUG',
            data: {
                kind,
                count: currentCount,
                ...data
            }
        });
    }
}

module.exports = PacketSniffer;
