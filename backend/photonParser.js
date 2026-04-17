const COMMAND_TYPES = {
    DISCONNECT: 4,
    SEND_RELIABLE: 6,
    SEND_UNRELIABLE: 7,
    SEND_FRAGMENT: 8
};

const MESSAGE_TYPES = {
    OPERATION_REQUEST: 2,
    OPERATION_RESPONSE: 3,
    EVENT: 4
};

const PACKET_STATUS = {
    UNDEFINED: 'undefined',
    SUCCESS: 'success',
    ENCRYPTED: 'encrypted',
    INVALID_CRC: 'invalid_crc',
    INVALID_HEADER: 'invalid_header',
    DISCONNECT_COMMAND: 'disconnect_command'
};

const PROTOCOL18_TYPES = {
    UNKNOWN: 0,
    BOOLEAN: 2,
    BYTE: 3,
    SHORT: 4,
    FLOAT: 5,
    DOUBLE: 6,
    STRING: 7,
    NULL: 8,
    COMPRESSED_INT: 9,
    COMPRESSED_LONG: 10,
    INT1: 11,
    INT1_NEGATIVE: 12,
    INT2: 13,
    INT2_NEGATIVE: 14,
    LONG1: 15,
    LONG1_NEGATIVE: 16,
    LONG2: 17,
    LONG2_NEGATIVE: 18,
    CUSTOM: 19,
    DICTIONARY: 20,
    HASHTABLE: 21,
    OBJECT_ARRAY: 23,
    OPERATION_REQUEST: 24,
    OPERATION_RESPONSE: 25,
    EVENT_DATA: 26,
    BOOLEAN_FALSE: 27,
    BOOLEAN_TRUE: 28,
    SHORT_ZERO: 29,
    INT_ZERO: 30,
    LONG_ZERO: 31,
    FLOAT_ZERO: 32,
    DOUBLE_ZERO: 33,
    BYTE_ZERO: 34,
    ARRAY: 0x40,
    CUSTOM_TYPE_SLIM: 0x80
};

class BufferCursor {
    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }

    remaining() {
        return this.buffer.length - this.offset;
    }

    seek(offset) {
        this.offset = offset;
    }

    readByte() {
        this.ensureAvailable(1);
        return this.buffer[this.offset++];
    }

    readBytes(count) {
        if (count === 0) {
            return Buffer.alloc(0);
        }

        this.ensureAvailable(count);
        const slice = this.buffer.subarray(this.offset, this.offset + count);
        this.offset += count;
        return Buffer.from(slice);
    }

    readInt16BE() {
        this.ensureAvailable(2);
        const value = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return value;
    }

    readInt16LE() {
        this.ensureAvailable(2);
        const value = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }

    readUInt16LE() {
        this.ensureAvailable(2);
        const value = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }

    readInt32BE() {
        this.ensureAvailable(4);
        const value = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return value;
    }

    readUInt32BE() {
        this.ensureAvailable(4);
        const value = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return value;
    }

    readFloatBE() {
        this.ensureAvailable(4);
        const value = this.buffer.readFloatBE(this.offset);
        this.offset += 4;
        return value;
    }

    readFloatLE() {
        this.ensureAvailable(4);
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }

    readDoubleBE() {
        this.ensureAvailable(8);
        const value = this.buffer.readDoubleBE(this.offset);
        this.offset += 8;
        return value;
    }

    readDoubleLE() {
        this.ensureAvailable(8);
        const value = this.buffer.readDoubleLE(this.offset);
        this.offset += 8;
        return value;
    }

    ensureAvailable(count) {
        if (count < 0 || this.remaining() < count) {
            throw new Error(`Unexpected end of buffer while reading ${count} byte(s).`);
        }
    }
}

function calculateCrc(buffer, length) {
    let result = 0xffffffff;
    const polynomial = 3988292384 >>> 0;

    for (let index = 0; index < length; index += 1) {
        result ^= buffer[index];
        for (let bit = 0; bit < 8; bit += 1) {
            if ((result & 1) !== 0) {
                result = (result >>> 1) ^ polynomial;
            } else {
                result >>>= 1;
            }
        }
    }

    return result >>> 0;
}

function getHexPreview(buffer, maxBytes = 24) {
    const previewCount = Math.min(buffer.length, maxBytes);
    const parts = [];

    for (let index = 0; index < previewCount; index += 1) {
        parts.push(buffer[index].toString(16).padStart(2, '0').toUpperCase());
    }

    if (buffer.length > previewCount) {
        parts.push('...');
    }

    return parts.join(' ');
}

class PhotonProtocol18Deserializer {
    deserialize(cursor, typeCode = null) {
        const resolvedType = typeCode ?? cursor.readByte();

        if (resolvedType >= PROTOCOL18_TYPES.CUSTOM_TYPE_SLIM) {
            return this.deserializeCustom(cursor, resolvedType);
        }

        switch (resolvedType) {
            case PROTOCOL18_TYPES.UNKNOWN:
            case PROTOCOL18_TYPES.NULL:
                return null;
            case PROTOCOL18_TYPES.BOOLEAN:
                return cursor.readByte() !== 0;
            case PROTOCOL18_TYPES.BYTE:
                return cursor.readByte();
            case PROTOCOL18_TYPES.SHORT:
                return cursor.readInt16LE();
            case PROTOCOL18_TYPES.FLOAT:
                return cursor.readFloatLE();
            case PROTOCOL18_TYPES.DOUBLE:
                return cursor.readDoubleLE();
            case PROTOCOL18_TYPES.STRING:
                return this.readString(cursor);
            case PROTOCOL18_TYPES.COMPRESSED_INT:
                return this.readCompressedInt32(cursor);
            case PROTOCOL18_TYPES.COMPRESSED_LONG:
                return this.readCompressedInt64(cursor);
            case PROTOCOL18_TYPES.INT1:
                return cursor.readByte();
            case PROTOCOL18_TYPES.INT1_NEGATIVE:
                return -cursor.readByte();
            case PROTOCOL18_TYPES.INT2:
                return cursor.readUInt16LE();
            case PROTOCOL18_TYPES.INT2_NEGATIVE:
                return -cursor.readUInt16LE();
            case PROTOCOL18_TYPES.LONG1:
                return cursor.readByte();
            case PROTOCOL18_TYPES.LONG1_NEGATIVE:
                return -cursor.readByte();
            case PROTOCOL18_TYPES.LONG2:
                return cursor.readUInt16LE();
            case PROTOCOL18_TYPES.LONG2_NEGATIVE:
                return -cursor.readUInt16LE();
            case PROTOCOL18_TYPES.CUSTOM:
                return this.deserializeCustom(cursor, 0);
            case PROTOCOL18_TYPES.DICTIONARY:
                return this.deserializeDictionary(cursor);
            case PROTOCOL18_TYPES.HASHTABLE:
                return this.deserializeHashtable(cursor);
            case PROTOCOL18_TYPES.OBJECT_ARRAY:
                return this.deserializeObjectArray(cursor);
            case PROTOCOL18_TYPES.OPERATION_REQUEST:
                return this.deserializeOperationRequest(cursor);
            case PROTOCOL18_TYPES.OPERATION_RESPONSE:
                return this.deserializeOperationResponse(cursor);
            case PROTOCOL18_TYPES.EVENT_DATA:
                return this.deserializeEventData(cursor);
            case PROTOCOL18_TYPES.BOOLEAN_FALSE:
                return false;
            case PROTOCOL18_TYPES.BOOLEAN_TRUE:
                return true;
            case PROTOCOL18_TYPES.SHORT_ZERO:
            case PROTOCOL18_TYPES.INT_ZERO:
            case PROTOCOL18_TYPES.LONG_ZERO:
            case PROTOCOL18_TYPES.FLOAT_ZERO:
            case PROTOCOL18_TYPES.DOUBLE_ZERO:
            case PROTOCOL18_TYPES.BYTE_ZERO:
                return 0;
            case PROTOCOL18_TYPES.ARRAY:
                return this.deserializeNestedArray(cursor);
            default:
                if ((resolvedType & PROTOCOL18_TYPES.ARRAY) === PROTOCOL18_TYPES.ARRAY) {
                    return this.deserializeTypedArray(cursor, resolvedType & ~PROTOCOL18_TYPES.ARRAY);
                }

                throw new Error(`Unsupported Protocol18 type: 0x${resolvedType.toString(16).toUpperCase()}`);
        }
    }

    deserializeOperationRequest(cursor) {
        const operationCode = cursor.readByte();
        const parameters = this.deserializeParameterTable(cursor);
        return { kind: 'request', operationCode, parameters };
    }

    deserializeOperationResponse(cursor) {
        const operationCode = cursor.readByte();
        const returnCode = cursor.readInt16LE();
        let debugMessage = '';

        if (cursor.remaining() > 0) {
            const debugValue = this.deserialize(cursor, cursor.readByte());
            debugMessage = typeof debugValue === 'string' ? debugValue : '';
        }

        const parameters = this.deserializeParameterTable(cursor);
        return { kind: 'response', operationCode, returnCode, debugMessage, parameters };
    }

    deserializeEventData(cursor) {
        const code = cursor.readByte();
        const parameters = this.deserializeParameterTable(cursor);
        return { kind: 'event', code, parameters };
    }

    deserializeParameterTable(cursor) {
        const size = this.readCount(cursor);
        const output = {};

        for (let index = 0; index < size; index += 1) {
            const key = cursor.readByte();
            const valueTypeCode = cursor.readByte();
            output[key] = this.deserialize(cursor, valueTypeCode);
        }

        return output;
    }

    deserializeDictionary(cursor) {
        const keyTypeCode = cursor.readByte();
        const valueTypeCode = cursor.readByte();
        const size = this.readCount(cursor);
        const entries = [];

        for (let index = 0; index < size; index += 1) {
            const key = this.deserialize(cursor, keyTypeCode === 0 ? cursor.readByte() : keyTypeCode);
            const value = this.deserialize(cursor, valueTypeCode === 0 ? cursor.readByte() : valueTypeCode);
            entries.push({ key, value });
        }

        return { kind: 'dictionary', entries };
    }

    deserializeHashtable(cursor) {
        const keyTypeCode = cursor.readByte();
        const valueTypeCode = cursor.readByte();
        const size = this.readCount(cursor);
        const entries = [];

        for (let index = 0; index < size; index += 1) {
            const key = this.deserialize(cursor, keyTypeCode === 0 ? cursor.readByte() : keyTypeCode);
            const value = this.deserialize(cursor, valueTypeCode === 0 ? cursor.readByte() : valueTypeCode);
            entries.push({ key, value });
        }

        return { kind: 'hashtable', entries };
    }

    deserializeObjectArray(cursor) {
        const size = this.readCount(cursor);
        const output = [];

        for (let index = 0; index < size; index += 1) {
            output.push(this.deserialize(cursor));
        }

        return output;
    }

    deserializeNestedArray(cursor) {
        const size = this.readCount(cursor);
        const typeCode = cursor.readByte();
        const output = [];

        for (let index = 0; index < size; index += 1) {
            const itemStart = cursor.offset;

            try {
                output.push(this.deserialize(cursor, typeCode));
            } catch (error) {
                cursor.seek(itemStart);

                if (this.tryDeserializeNestedItemWithRepeatedTypeCode(cursor, typeCode, output)) {
                    continue;
                }

                cursor.seek(itemStart);
                throw error;
            }
        }

        return output;
    }

    deserializeTypedArray(cursor, elementTypeCode) {
        const size = this.readCount(cursor);

        switch (elementTypeCode) {
            case PROTOCOL18_TYPES.BOOLEAN: {
                const packedByteCount = Math.ceil(size / 8);
                const packed = cursor.readBytes(packedByteCount);
                const output = [];

                for (let index = 0; index < size; index += 1) {
                    const byteIndex = Math.floor(index / 8);
                    const bitIndex = index % 8;
                    output.push((packed[byteIndex] & (1 << bitIndex)) !== 0);
                }

                return output;
            }
            case PROTOCOL18_TYPES.BYTE:
                return Array.from(cursor.readBytes(size));
            case PROTOCOL18_TYPES.SHORT: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(cursor.readInt16LE());
                }
                return output;
            }
            case PROTOCOL18_TYPES.FLOAT: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(cursor.readFloatLE());
                }
                return output;
            }
            case PROTOCOL18_TYPES.DOUBLE: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(cursor.readDoubleLE());
                }
                return output;
            }
            case PROTOCOL18_TYPES.STRING: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(this.readString(cursor));
                }
                return output;
            }
            case PROTOCOL18_TYPES.CUSTOM: {
                const customType = cursor.readByte();
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(this.deserializeCustomPayload(cursor, customType));
                }
                return output;
            }
            case PROTOCOL18_TYPES.DICTIONARY: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(this.deserializeDictionary(cursor));
                }
                return output;
            }
            case PROTOCOL18_TYPES.HASHTABLE: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(this.deserializeHashtable(cursor));
                }
                return output;
            }
            case PROTOCOL18_TYPES.COMPRESSED_INT: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(this.readCompressedInt32(cursor));
                }
                return output;
            }
            case PROTOCOL18_TYPES.COMPRESSED_LONG: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(this.readCompressedInt64(cursor));
                }
                return output;
            }
            default: {
                const output = [];
                for (let index = 0; index < size; index += 1) {
                    output.push(this.deserialize(cursor, elementTypeCode));
                }
                return output;
            }
        }
    }

    tryDeserializeNestedItemWithRepeatedTypeCode(cursor, typeCode, output) {
        const start = cursor.offset;

        try {
            if (!this.isNestedCompressedArrayType(typeCode) || cursor.readByte() !== typeCode) {
                cursor.seek(start);
                return false;
            }

            output.push(this.deserialize(cursor, typeCode));
            return true;
        } catch {
            cursor.seek(start);
            return false;
        }
    }

    isNestedCompressedArrayType(typeCode) {
        return typeCode === (PROTOCOL18_TYPES.ARRAY | PROTOCOL18_TYPES.COMPRESSED_INT)
            || typeCode === (PROTOCOL18_TYPES.ARRAY | PROTOCOL18_TYPES.COMPRESSED_LONG);
    }

    deserializeCustom(cursor, gpType) {
        const isSlimCustomType = gpType >= PROTOCOL18_TYPES.CUSTOM_TYPE_SLIM;
        const customType = isSlimCustomType ? (gpType & 0x7F) : cursor.readByte();
        return this.deserializeCustomPayload(cursor, customType, isSlimCustomType);
    }

    deserializeCustomPayload(cursor, customType, isSlimCustomType = false) {
        const start = cursor.offset;
        const size = this.readCount(cursor);

        if (size < 0 || size > cursor.remaining()) {
            if (isSlimCustomType) {
                cursor.seek(start);
                return cursor.readBytes(cursor.remaining());
            }

            throw new Error(`Custom type ${customType} reported invalid size ${size}.`);
        }

        return cursor.readBytes(size);
    }

    readString(cursor) {
        const start = cursor.offset;
        const compressedLength = this.tryReadCompressedLength(cursor);

        if (compressedLength !== null && compressedLength <= cursor.remaining()) {
            return cursor.readBytes(compressedLength).toString('utf8');
        }

        cursor.seek(start);

        const lengthType = cursor.readByte();
        let length;

        switch (lengthType) {
            case 0:
                return '';
            case 1:
                length = cursor.readByte();
                break;
            case 2:
                length = cursor.readUInt16LE();
                break;
            case 4:
                length = cursor.readInt32BE();
                break;
            default:
                throw new Error(`Unsupported string length type ${lengthType}.`);
        }

        if (length < 0 || length > cursor.remaining()) {
            throw new Error(`Invalid string length ${length}.`);
        }

        return cursor.readBytes(length).toString('utf8');
    }

    tryReadCompressedLength(cursor) {
        const start = cursor.offset;

        try {
            const value = this.readCompressedUInt32(cursor);
            if (value > 0x7fffffff) {
                cursor.seek(start);
                return null;
            }

            return value;
        } catch {
            cursor.seek(start);
            return null;
        }
    }

    readCount(cursor) {
        const count = this.tryReadCompressedLength(cursor);
        if (count === null) {
            throw new Error('Failed to read compressed Protocol18 count.');
        }

        return count;
    }

    readCompressedUInt32(cursor) {
        let value = 0;
        let shift = 0;

        while (shift < 35) {
            const current = cursor.readByte();
            value |= (current & 0x7F) << shift;
            if ((current & 0x80) === 0) {
                return value >>> 0;
            }

            shift += 7;
        }

        throw new Error('Compressed UInt32 is too large.');
    }

    readCompressedUInt64(cursor) {
        let value = 0n;
        let shift = 0n;

        while (shift < 70n) {
            const current = BigInt(cursor.readByte());
            value |= (current & 0x7Fn) << shift;
            if ((current & 0x80n) === 0n) {
                return value;
            }

            shift += 7n;
        }

        throw new Error('Compressed UInt64 is too large.');
    }

    readCompressedInt32(cursor) {
        const value = this.readCompressedUInt32(cursor);
        return (value >>> 1) ^ -(value & 1);
    }

    readCompressedInt64(cursor) {
        const value = this.readCompressedUInt64(cursor);
        const signed = (value >> 1n) ^ -(value & 1n);

        if (signed <= BigInt(Number.MAX_SAFE_INTEGER) && signed >= BigInt(Number.MIN_SAFE_INTEGER)) {
            return Number(signed);
        }

        return signed.toString();
    }
}

class PhotonPacketParser {
    constructor() {
        this.pendingSegments = new Map();
        this.deserializer = new PhotonProtocol18Deserializer();
    }

    receivePacket(payload) {
        const cursor = new BufferCursor(Buffer.from(payload));

        if (cursor.remaining() < 12) {
            return { status: PACKET_STATUS.INVALID_HEADER, packets: [] };
        }

        cursor.readInt16BE();
        const flags = cursor.readByte();
        const commandCount = cursor.readByte();
        cursor.readInt32BE();
        cursor.readInt32BE();

        if (flags === 1) {
            return { status: PACKET_STATUS.ENCRYPTED, packets: [] };
        }

        if (flags === 0xCC && cursor.remaining() >= 4) {
            const crcOffset = cursor.offset;
            const expectedCrc = cursor.readUInt32BE();
            const crcBuffer = Buffer.from(payload);
            crcBuffer.writeUInt32BE(0, crcOffset);

            if (calculateCrc(crcBuffer, crcBuffer.length) !== expectedCrc) {
                return { status: PACKET_STATUS.INVALID_CRC, packets: [] };
            }
        }

        let status = PACKET_STATUS.UNDEFINED;
        const packets = [];

        for (let commandIndex = 0; commandIndex < commandCount; commandIndex += 1) {
            if (cursor.remaining() < 12) {
                return { status: PACKET_STATUS.INVALID_HEADER, packets };
            }

            const commandStatus = this.handleCommand(cursor, packets);
            if (commandStatus === PACKET_STATUS.INVALID_HEADER || commandStatus === PACKET_STATUS.DISCONNECT_COMMAND) {
                return { status: commandStatus, packets };
            }

            if (commandStatus !== PACKET_STATUS.UNDEFINED) {
                status = commandStatus;
            }
        }

        return {
            status: status === PACKET_STATUS.UNDEFINED ? PACKET_STATUS.SUCCESS : status,
            packets
        };
    }

    handleCommand(cursor, packets) {
        const commandType = cursor.readByte();
        cursor.readByte();
        cursor.readByte();
        cursor.readByte();
        let commandLength = cursor.readInt32BE() - 12;
        cursor.readInt32BE();

        if (commandLength < 0 || cursor.remaining() < commandLength) {
            return PACKET_STATUS.INVALID_HEADER;
        }

        switch (commandType) {
            case COMMAND_TYPES.DISCONNECT:
                cursor.seek(cursor.offset + commandLength);
                return PACKET_STATUS.DISCONNECT_COMMAND;
            case COMMAND_TYPES.SEND_UNRELIABLE:
                if (commandLength < 4) {
                    return PACKET_STATUS.INVALID_HEADER;
                }
                cursor.seek(cursor.offset + 4);
                commandLength -= 4;
                return this.handleSendReliable(cursor, commandLength, packets);
            case COMMAND_TYPES.SEND_RELIABLE:
                return this.handleSendReliable(cursor, commandLength, packets);
            case COMMAND_TYPES.SEND_FRAGMENT:
                return this.handleSendFragment(cursor, commandLength, packets);
            default:
                cursor.seek(cursor.offset + commandLength);
                return PACKET_STATUS.UNDEFINED;
        }
    }

    handleSendReliable(cursor, commandLength, packets) {
        if (commandLength < 2) {
            return PACKET_STATUS.INVALID_HEADER;
        }

        const signalByte = cursor.readByte();
        const messageType = cursor.readByte();
        const payloadLength = commandLength - 2;

        if (payloadLength < 0 || cursor.remaining() < payloadLength) {
            return PACKET_STATUS.INVALID_HEADER;
        }

        const payload = cursor.readBytes(payloadLength);
        const payloadCursor = new BufferCursor(payload);
        const payloadPreview = getHexPreview(payload);

        if (messageType === 131) {
            return PACKET_STATUS.ENCRYPTED;
        }

        try {
            switch (messageType) {
                case MESSAGE_TYPES.OPERATION_REQUEST: {
                    const packet = this.deserializer.deserializeOperationRequest(payloadCursor);
                    packets.push({ ...packet, signalByte, messageType, payloadPreview });
                    break;
                }
                case MESSAGE_TYPES.OPERATION_RESPONSE: {
                    const packet = this.deserializer.deserializeOperationResponse(payloadCursor);
                    packets.push({ ...packet, signalByte, messageType, payloadPreview });
                    break;
                }
                case MESSAGE_TYPES.EVENT: {
                    const packet = this.deserializer.deserializeEventData(payloadCursor);
                    packets.push({ ...packet, signalByte, messageType, payloadPreview });
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            packets.push({
                kind: 'decode_error',
                signalByte,
                messageType,
                payloadPreview,
                error: error.message
            });
        }

        return PACKET_STATUS.SUCCESS;
    }

    handleSendFragment(cursor, commandLength, packets) {
        if (commandLength < 20) {
            return PACKET_STATUS.INVALID_HEADER;
        }

        const startSequenceNumber = cursor.readInt32BE();
        cursor.readInt32BE();
        cursor.readInt32BE();
        const totalLength = cursor.readInt32BE();
        const fragmentOffset = cursor.readInt32BE();
        const fragmentLength = commandLength - 20;

        if (fragmentLength < 0 || cursor.remaining() < fragmentLength) {
            return PACKET_STATUS.INVALID_HEADER;
        }

        const segmented = this.getSegmentedPackage(startSequenceNumber, totalLength);
        const fragment = cursor.readBytes(fragmentLength);
        fragment.copy(segmented.totalPayload, fragmentOffset);
        segmented.bytesWritten += fragment.length;

        if (segmented.bytesWritten >= segmented.totalLength) {
            this.pendingSegments.delete(startSequenceNumber);
            return this.handleFinishedSegmentedPackage(segmented.totalPayload, packets);
        }

        return PACKET_STATUS.SUCCESS;
    }

    handleFinishedSegmentedPackage(totalPayload, packets) {
        const cursor = new BufferCursor(totalPayload);
        return this.handleSendReliable(cursor, totalPayload.length, packets);
    }

    getSegmentedPackage(sequenceNumber, totalLength) {
        if (this.pendingSegments.has(sequenceNumber)) {
            return this.pendingSegments.get(sequenceNumber);
        }

        const segmented = {
            totalLength,
            totalPayload: Buffer.alloc(totalLength),
            bytesWritten: 0
        };

        this.pendingSegments.set(sequenceNumber, segmented);
        return segmented;
    }
}

module.exports = {
    PhotonPacketParser,
    PACKET_STATUS
};
