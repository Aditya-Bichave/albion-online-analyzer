# Script to properly add translations to BuildView.tagOptions section

$basePath = 'Z:\Projects\Apps\Mvp project\ao-pocket\messages\'

# Define translations for each language
$translations = @{
    'de.json' = @{ Activity = 'Andere Aktivität'; Location = 'Anderer Ort' }
    'es.json' = @{ Activity = 'Otra Actividad'; Location = 'Otra Ubicación' }
    'fr.json' = @{ Activity = 'Autre Activité'; Location = 'Autre Lieu' }
    'pt.json' = @{ Activity = 'Outra Atividade'; Location = 'Outro Local' }
    'ru.json' = @{ Activity = 'Другое занятие'; Location = 'Другое место' }
    'ko.json' = @{ Activity = '기타 활동'; Location = '기타 지역' }
    'zh.json' = @{ Activity = '其他活动'; Location = '其他地点' }
    'pl.json' = @{ Activity = 'Inna Aktywność'; Location = 'Inna Lokalizacja' }
    'tr.json' = @{ Activity = 'Diğer Aktivite'; Location = 'Diğer Konum' }
}

foreach ($fileName in $translations.Keys) {
    $filePath = $basePath + $fileName
    Write-Host "Processing $fileName..."
    
    # Read all lines
    $lines = Get-Content $filePath
    
    # Find the BuildView section, then find tagOptions within it, then find roads_avalon
    $inBuildView = $false
    $inTagOptions = $false
    $roadsAvalonLineIndex = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        if ($line -match '"BuildView":\s*\{') {
            $inBuildView = $true
        }
        
        if ($inBuildView -and $line -match '"tagOptions":\s*\{') {
            $inTagOptions = $true
        }
        
        if ($inTagOptions -and $line -match '"roads_avalon":' -and $line -notmatch 'other_activity') {
            $roadsAvalonLineIndex = $i
            break
        }
        
        # Exit tagOptions section when we hit closing brace
        if ($inTagOptions -and $line -match '^\s*\},?\s*$') {
            $inTagOptions = $false
        }
    }
    
    if ($roadsAvalonLineIndex -ge 0) {
        Write-Host "  Found roads_avalon at line $($roadsAvalonLineIndex + 1)"
        
        # Get the roads_avalon line and ensure it has a comma
        $roadsLine = $lines[$roadsAvalonLineIndex]
        $lines[$roadsAvalonLineIndex] = $roadsLine.TrimEnd().TrimEnd('}') + ','
        
        # Create new lines to insert (properly formatted)
        $activityLine = '      "other_activity": "' + $translations[$fileName].Activity + '",'
        $locationLine = '      "other_location": "' + $translations[$fileName].Location + '"'
        
        # Build new content
        $result = @()
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $result += $lines[$i]
            if ($i -eq $roadsAvalonLineIndex) {
                $result += $activityLine
                $result += $locationLine
            }
        }
        
        # Write back
        [System.IO.File]::WriteAllLines($filePath, $result, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  Added translations successfully!"
    } else {
        Write-Host "  ERROR: Could not find roads_avalon in BuildView.tagOptions"
    }
}

Write-Host "`nAll files processed!"
