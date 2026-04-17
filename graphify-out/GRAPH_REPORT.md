# Graph Report - C:\Aditya\Projects\Games ALbion\Alalyzer  (2026-04-17)

## Corpus Check
- Corpus is ~21,831 words - fits in a single context window. You may not need a graph.

## Summary
- 187 nodes · 391 edges · 25 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `PacketSniffer` - 36 edges
2. `PhotonProtocol18Deserializer` - 22 edges
3. `BufferCursor` - 16 edges
4. `isFiniteNumber()` - 10 edges
5. `MapDataSource` - 9 edges
6. `main()` - 9 edges
7. `PhotonPacketParser` - 8 edges
8. `Overlay` - 7 edges
9. `Simulator` - 6 edges
10. `Configuration` - 6 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `Configuration`  [EXTRACTED]
  C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py → C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py  _Bridges community 12 → community 10_
- `main()` --calls--> `SystemTrayIcon`  [EXTRACTED]
  C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py → C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py  _Bridges community 13 → community 10_
- `main()` --calls--> `ImageProcessor`  [EXTRACTED]
  C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py → C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py  _Bridges community 11 → community 10_
- `main()` --calls--> `MapDataSource`  [EXTRACTED]
  C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py → C:\Aditya\Projects\Games ALbion\Alalyzer\third_party\albion-minimap-overlay\albion-minimap-overlay.py  _Bridges community 4 → community 10_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (3): isFiniteNumber(), PacketSniffer, reverseFloat32Endian()

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (1): PhotonProtocol18Deserializer

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (4): BufferCursor, calculateCrc(), getHexPreview(), PhotonPacketParser

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (2): GameMap, MapDataSource

### Community 5 - "Community 5"
Cohesion: 0.36
Nodes (5): getNodeCommand(), getNpmCommand(), startServices(), stopChildProcess(), stopServices()

### Community 6 - "Community 6"
Cohesion: 0.43
Nodes (7): broadcast(), createEngine(), sendStateSnapshot(), sendToClient(), startMode(), stopCurrentEngine(), switchMode()

### Community 7 - "Community 7"
Cohesion: 0.57
Nodes (6): decodeAlbionPacket(), extractAlbionEventCode(), isPlainObject(), normalizePackedEventCode(), summarizeValue(), tryGetShortCode()

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (1): Simulator

### Community 9 - "Community 9"
Cohesion: 0.6
Nodes (1): Overlay

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (4): Creator, main(), MapFilter, Printer

### Community 11 - "Community 11"
Cohesion: 0.6
Nodes (1): ImageProcessor

### Community 12 - "Community 12"
Cohesion: 0.7
Nodes (1): Configuration

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (1): SystemTrayIcon

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 15`** (2 nodes): `models.js`, `getRandomResource()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `mapCalibration.js`, `getMapCalibration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `ConsoleLogger.jsx`, `ConsoleLogger()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `InteractiveMap.jsx`, `InteractiveMap()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `ResourceIcon.jsx`, `ResourceIcon()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `ResourceSidebar.jsx`, `ResourceSidebar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MapDataSource` connect `Community 4` to `Community 10`, `Community 3`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `BufferCursor` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._