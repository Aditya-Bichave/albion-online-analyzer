const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const fixtures = require('./fixtures/upstream-world-entities.json');
const { getMobCatalog, getZoneCatalog } = require('../albionData');
const {
    extractMobEntity,
    extractDungeonEntity,
    extractChestEntity,
    extractFishingEntity,
    extractCageEntity,
    extractPlayerMoveRequest,
    extractPlayerJoinInfo
} = require('../worldEntityExtractors');

test('extractPlayerMoveRequest reads Protocol18 move request coordinates', () => {
    const result = extractPlayerMoveRequest(fixtures.moveRequest.parameters);

    assert.deepEqual(result.position, { x: -338.0939, y: -19.720356 });
});

test('extractPlayerJoinInfo reads join-finished player identity and position', () => {
    const result = extractPlayerJoinInfo(fixtures.joinFinished.parameters);

    assert.equal(result.entityId, 6740);
    assert.equal(result.name, 'XXXXX');
    assert.deepEqual(result.position, { x: -338.0939, y: -19.720356 });
});

test('extractMobEntity recognizes mists from real NewMob packets', () => {
    const result = extractMobEntity(fixtures.mistMob.parameters, getMobCatalog());

    assert.equal(result.kind, 'mist');
    assert.equal(result.label, 'Mists Solo Yellow');
    assert.deepEqual(result.position, { x: -330, y: -60 });
});

test('extractMobEntity classifies ordinary mobs with catalog metadata', () => {
    const result = extractMobEntity({
        0: 9001,
        1: 15,
        2: 255,
        7: [-319.77, -55.41],
        8: [-319.77, -55.41],
        13: 5396,
        19: 1,
        33: 0,
        252: 123
    }, getMobCatalog());

    assert.equal(result.kind, 'mob');
    assert.equal(result.typeId, 15);
    assert.equal(typeof result.avatar, 'string');
    assert.deepEqual(result.position, { x: -319.77, y: -55.41 });
});

test('extractDungeonEntity parses solo dungeon exits', () => {
    const result = extractDungeonEntity(fixtures.dungeon.parameters);

    assert.equal(result.kind, 'dungeon');
    assert.equal(result.dungeonType, 'solo');
    assert.equal(result.tier, 5);
});

test('extractChestEntity parses chest rarity and position', () => {
    const result = extractChestEntity(fixtures.chest.parameters);

    assert.equal(result.kind, 'chest');
    assert.equal(result.rarity, 4);
    assert.deepEqual(result.position, { x: 311.5, y: -345.5 });
});

test('extractFishingEntity parses fishing nodes', () => {
    const result = extractFishingEntity(fixtures.fishing.parameters);

    assert.equal(result.kind, 'fishing');
    assert.equal(result.label, 'Fishing Node Fish');
    assert.deepEqual(result.position, { x: -371.1, y: 62.2 });
});

test('extractCageEntity parses caged wisps from pcap-derived fixture', () => {
    const result = extractCageEntity(fixtures.cage.parameters);

    assert.equal(result.kind, 'cage');
    assert.equal(result.label, 'Shared Fill Cage Wisp Undead A');
    assert.deepEqual(result.position, { x: -138.5, y: -277.5 });
});

test('zone catalog enriches real zone ids with pvp metadata and map asset ids', () => {
    const zone = getZoneCatalog().enrichZone(fixtures.zone);

    assert.equal(zone.pvpType, 'black');
    assert.equal(zone.mapAsset, '1305');
    assert.equal(zone.name, 'Brambleshore Hinterlands');
});
