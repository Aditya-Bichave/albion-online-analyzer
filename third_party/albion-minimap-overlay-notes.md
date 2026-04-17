# `ph5x5/albion-minimap-overlay` comparison notes

This repository is cloned here as a reference implementation only.

Useful ideas for `Alalyzer`:
- resolution and interface-scale calibration matter for map rendering quality
- caching map or zone state helps reconnects and late UI joins
- overlay projection logic is worth studying as a calibration reference

Intentionally not adopted in `Alalyzer`:
- OCR-based zone detection
- Tesseract runtime dependency
- AlbionOnline2D as a runtime data source
- hard-coded projection onto Albion's in-game minimap window

Current `Alalyzer` direction:
- keep live packet decoding as the primary data source
- use simulation mode as the only built-in fallback
- adapt calibration concepts inside the React map instead of drawing over the game client
