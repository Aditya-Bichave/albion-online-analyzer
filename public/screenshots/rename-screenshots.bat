@echo off
REM Rename existing screenshots to match convention
REM Run this from the public\screenshots\tools directory

echo Renaming screenshots to standard convention...
echo.

REM Gold Price
if exist "AlbionKit-Gold-Price.png" (
    ren "AlbionKit-Gold-Price.png" "gold-price.png"
    echo ✓ Renamed: AlbionKit-Gold-Price.png → gold-price.png
)

REM Kill Feed (keep the best one, rename others with -backup suffix)
if exist "AlbionKit Live KillFeed.png" (
    ren "AlbionKit Live KillFeed.png" "kill-feed.png"
    echo ✓ Renamed: AlbionKit Live KillFeed.png → kill-feed.png
)
if exist "kill-feed.png" if exist "kf 1AlbionKit Live KillFeed.png" (
    ren "kf 1AlbionKit Live KillFeed.png" "kill-feed-backup-1.png"
    echo ✓ Renamed: kf 1AlbionKit Live KillFeed.png → kill-feed-backup-1.png
)
if exist "kill-feed.png" if exist "kf2 1AlbionKit Live KillFeed.png" (
    ren "kf2 1AlbionKit Live KillFeed.png" "kill-feed-backup-2.png"
    echo ✓ Renamed: kf2 1AlbionKit Live KillFeed.png → kill-feed-backup-2.png
)
if exist "kill-feed.png" if exist "kf3 1AlbionKit Live KillFeed.png" (
    ren "kf3 1AlbionKit Live KillFeed.png" "kill-feed-backup-3.png"
    echo ✓ Renamed: kf3 1AlbionKit Live KillFeed.png → kill-feed-backup-3.png
)

REM Market Flipper
if exist "mflipper 1AlbionKit Market Flipper.png" (
    ren "mflipper 1AlbionKit Market Flipper.png" "market-flipper.png"
    echo ✓ Renamed: mflipper 1AlbionKit Market Flipper.png → market-flipper.png
)
if exist "market-flipper.png" if exist "mflipper1 1AlbionKit Market Flipper.png" (
    ren "mflipper1 1AlbionKit Market Flipper.png" "market-flipper-backup-1.png"
    echo ✓ Renamed: mflipper1 1AlbionKit Market Flipper.png → market-flipper-backup-1.png
)

REM PvP Intel
if exist "pvpintel 1AlbionKit Pvp Intel.png" (
    ren "pvpintel 1AlbionKit Pvp Intel.png" "pvp-intel.png"
    echo ✓ Renamed: pvpintel 1AlbionKit Pvp Intel.png → pvp-intel.png
)
if exist "pvp-intel.png" if exist "pvpintel 2AlbionKit Pvp Intel.png" (
    ren "pvpintel 2AlbionKit Pvp Intel.png" "pvp-intel-backup-1.png"
    echo ✓ Renamed: pvpintel 2AlbionKit Pvp Intel.png → pvp-intel-backup-1.png
)
if exist "pvp-intel.png" if exist "pvpintel 3AlbionKit Pvp Intel.png" (
    ren "pvpintel 3AlbionKit Pvp Intel.png" "pvp-intel-backup-2.png"
    echo ✓ Renamed: pvpintel 3AlbionKit Pvp Intel.png → pvp-intel-backup-2.png
)

REM ZvZ Tracker
if exist "zvz 1AlbionKit ZvZ Tracker.png" (
    ren "zvz 1AlbionKit ZvZ Tracker.png" "zvz-tracker.png"
    echo ✓ Renamed: zvz 1AlbionKit ZvZ Tracker.png → zvz-tracker.png
)

echo.
echo Renaming complete!
echo.
echo Next steps:
echo 1. Review the renamed files
echo 2. Delete backup files if not needed
echo 3. Take remaining screenshots (see checklist in docs/SCREENSHOT_SETUP_COMPLETE.md)
echo.
pause
