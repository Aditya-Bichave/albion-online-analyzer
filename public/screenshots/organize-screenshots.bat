@echo off
REM Organize and rename all screenshots to standard convention
REM Run from public\screenshots directory

echo ========================================
echo AlbionKit Screenshot Organizer
echo ========================================
echo.

REM ========================================
REM TOOLS FOLDER
REM ========================================
echo === Organizing Tools Screenshots ===
echo.

cd tools

REM Gold Price
if exist "AlbionKit-Gold-Price.png" (
    ren "AlbionKit-Gold-Price.png" "gold-price.png"
    echo [OK] Renamed: AlbionKit-Gold-Price.png → gold-price.png
)

REM Kill Feed - Keep best version as main, others as backups
if exist "kf 1AlbionKit Live KillFeed.png" (
    ren "kf 1AlbionKit Live KillFeed.png" "kill-feed.png"
    echo [OK] Renamed: kf 1AlbionKit Live KillFeed.png → kill-feed.png
)
if exist "kill-feed.png" if exist "kf2 1AlbionKit Live KillFeed.png" (
    ren "kf2 1AlbionKit Live KillFeed.png" "kill-feed-backup-1.png"
    echo [OK] Renamed: kf2 1AlbionKit Live KillFeed.png → kill-feed-backup-1.png
)
if exist "kill-feed.png" if exist "kf3 1AlbionKit Live KillFeed.png" (
    ren "kf3 1AlbionKit Live KillFeed.png" "kill-feed-backup-2.png"
    echo [OK] Renamed: kf3 1AlbionKit Live KillFeed.png → kill-feed-backup-2.png
)

REM Market Flipper - Keep best version as main
if exist "mflipper 1AlbionKit Market Flipper.png" (
    ren "mflipper 1AlbionKit Market Flipper.png" "market-flipper.png"
    echo [OK] Renamed: mflipper 1AlbionKit Market Flipper.png → market-flipper.png
)
if exist "market-flipper.png" if exist "mflipper1 1AlbionKit Market Flipper.png" (
    ren "mflipper1 1AlbionKit Market Flipper.png" "market-flipper-backup-1.png"
    echo [OK] Renamed: mflipper1 1AlbionKit Market Flipper.png → market-flipper-backup-1.png
)

REM PvP Intel - Keep best version as main
if exist "pvpintel 1AlbionKit Pvp Intel.png" (
    ren "pvpintel 1AlbionKit Pvp Intel.png" "pvp-intel.png"
    echo [OK] Renamed: pvpintel 1AlbionKit Pvp Intel.png → pvp-intel.png
)
if exist "pvp-intel.png" if exist "pvpintel 2AlbionKit Pvp Intel.png" (
    ren "pvpintel 2AlbionKit Pvp Intel.png" "pvp-intel-backup-1.png"
    echo [OK] Renamed: pvpintel 2AlbionKit Pvp Intel.png → pvp-intel-backup-1.png
)
if exist "pvp-intel.png" if exist "pvpintel 3AlbionKit Pvp Intel.png" (
    ren "pvpintel 3AlbionKit Pvp Intel.png" "pvp-intel-backup-2.png"
    echo [OK] Renamed: pvpintel 3AlbionKit Pvp Intel.png → pvp-intel-backup-2.png
)

REM ZvZ Tracker
if exist "zvz 1AlbionKit ZvZ Tracker.png" (
    ren "zvz 1AlbionKit ZvZ Tracker.png" "zvz-tracker.png"
    echo [OK] Renamed: zvz 1AlbionKit ZvZ Tracker.png → zvz-tracker.png
)

cd ..
echo.

REM ========================================
REM PROFITS FOLDER
REM ========================================
echo === Organizing Profits Screenshots ===
echo.

cd profits

REM Alchemy
if exist "Alchemy.png" (
    ren "Alchemy.png" "alchemy-calc.png"
    echo [OK] Renamed: Alchemy.png → alchemy-calc.png
)

REM Animal Husbandry
if exist "Animal.png" (
    ren "Animal.png" "animal-calc.png"
    echo [OK] Renamed: Animal.png → animal-calc.png
)

REM Chopped Fish
if exist "chopped fish.png" (
    ren "chopped fish.png" "chopped-fish-calc.png"
    echo [OK] Renamed: chopped fish.png → chopped-fish-calc.png
)

REM Cooking
if exist "Cooking Calculator.png" (
    ren "Cooking Calculator.png" "cooking-calc.png"
    echo [OK] Renamed: Cooking Calculator.png → cooking-calc.png
)

REM Crafting
if exist "Crafting Planner.png" (
    ren "Crafting Planner.png" "crafting-calc.png"
    echo [OK] Renamed: Crafting Planner.png → crafting-calc.png
)

REM Enchanting
if exist "Enchanting.png" (
    ren "Enchanting.png" "enchanting-calc.png"
    echo [OK] Renamed: Enchanting.png → enchanting-calc.png
)

REM Farming
if exist "Farming Calculator.png" (
    ren "Farming Calculator.png" "farming-calc.png"
    echo [OK] Renamed: Farming Calculator.png → farming-calc.png
)

REM Labourers
if exist "Labourer.png" (
    ren "Labourer.png" "labour-calc.png"
    echo [OK] Renamed: Labourer.png → labour-calc.png
)

cd ..
echo.

REM ========================================
REM BUILDS FOLDER
REM ========================================
echo === Organizing Builds Screenshots ===
echo.

cd builds

REM Build Detail (rename to match convention)
if exist "build 1.png" (
    ren "build 1.png" "build-detail.png"
    echo [OK] Renamed: build 1.png → build-detail.png
)

REM Add builds-list placeholder note
if not exist "builds-list.png" (
    echo [NOTE] Still need: builds-list.png (main builds database page)
)

cd ..
echo.

REM ========================================
REM MISC FOLDER
REM ========================================
echo === Organizing Misc Screenshots ===
echo.

cd misc

REM Keep AlbionKit.jpg as homepage.png
if exist "AlbionKit.jpg" (
    ren "AlbionKit.jpg" "homepage.png"
    echo [OK] Renamed: AlbionKit.jpg → homepage.png
)

REM Logo files - keep as logo.png
if exist "AlbionKitLogo.png" (
    if not exist "logo.png" (
        ren "AlbionKitLogo.png" "logo.png"
        echo [OK] Renamed: AlbionKitLogo.png → logo.png
    ) else (
        del "AlbionKitLogo.png"
        echo [DEL] Deleted duplicate: AlbionKitLogo.png
    )
)

if exist "AlbionKit Logo.png" (
    if not exist "logo-alt.png" (
        ren "AlbionKit Logo.png" "logo-alt.png"
        echo [OK] Renamed: AlbionKit Logo.png → logo-alt.png
    )
)

REM Tools overview - keep if useful
if exist "AlbionKit Tools.png" (
    ren "AlbionKit Tools.png" "tools-overview.png"
    echo [OK] Renamed: AlbionKit Tools.png → tools-overview.png
)

REM Guild Tools - keep as guild-tools.png
if exist "AlbionKit Guild Tools.png" (
    ren "AlbionKit Guild Tools.png" "guild-tools.png"
    echo [OK] Renamed: AlbionKit Guild Tools.png → guild-tools.png
)

cd ..
echo.

REM ========================================
REM SUMMARY
REM ========================================
echo ========================================
echo Organization Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Review renamed files
echo 2. Delete backup files if not needed (optional)
echo 3. Take remaining screenshots:
echo    - builds/builds-list.png
echo    - forum/forum-list.png
echo    - forum/thread-detail.png
echo    - user/profile.png
echo    - user/settings.png
echo    - misc/login.png
echo    - misc/about.png
echo.
echo See docs/SCREENSHOT_SETUP_COMPLETE.md for full checklist
echo.
pause
