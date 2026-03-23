# Script to add translations to BuildView.tagOptions section in all language files
# This script finds the exact location in the BuildView section and adds translations properly

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
    
    # Read file as raw text
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.UTF8Encoding]::new($false))
    
    # Find the BuildView section, then find tagOptions within it
    $buildViewIndex = $content.IndexOf('"BuildView":')
    if ($buildViewIndex -lt 0) {
        Write-Host "  ERROR: Could not find BuildView section"
        continue
    }
    
    $tagOptionsIndex = $content.IndexOf('"tagOptions":', $buildViewIndex)
    if ($tagOptionsIndex -lt 0) {
        Write-Host "  ERROR: Could not find tagOptions in BuildView"
        continue
    }
    
    # Find the closing brace of tagOptions to find roads_avalon before it
    $braceCount = 0
    $inTagOptions = $false
    $roadsAvalonStart = -1
    $roadsAvalonEnd = -1
    
    for ($i = $tagOptionsIndex; $i -lt $content.Length; $i++) {
        if ($content[$i] -eq '{') {
            if (-not $inTagOptions) {
                $inTagOptions = $true
            }
            $braceCount++
        } elseif ($content[$i] -eq '}') {
            $braceCount--
            if ($inTagOptions -and $braceCount -eq 0) {
                # Found the closing brace of tagOptions
                # Now find roads_avalon before this
                $sectionContent = $content.Substring($tagOptionsIndex, $i - $tagOptionsIndex)
                $lastRoadsIndex = $sectionContent.LastIndexOf('"roads_avalon":')
                if ($lastRoadsIndex -ge 0) {
                    $roadsAvalonStart = $tagOptionsIndex + $lastRoadsIndex
                    # Find the end of the roads_avalon line
                    $nextNewline = $content.IndexOf("`n", $roadsAvalonStart)
                    if ($nextNewline -gt 0) {
                        $roadsAvalonEnd = $nextNewline
                    }
                }
                break
            }
        }
    }
    
    if ($roadsAvalonStart -ge 0 -and $roadsAvalonEnd -gt 0) {
        Write-Host "  Found roads_avalon at position $roadsAvalonStart"
        
        # Get the roads_avalon line
        $roadsLine = $content.Substring($roadsAvalonStart, $roadsAvalonEnd - $roadsAvalonStart).TrimEnd("`r`n")
        
        # Ensure it ends with a comma
        if (-not $roadsLine.EndsWith(',')) {
            $roadsLine = $roadsLine + ','
        }
        
        # Create replacement
        $newLines = $roadsLine + "`r`n" +
                    '      "other_activity": "' + $translations[$fileName].Activity + '",' + "`r`n" +
                    '      "other_location": "' + $translations[$fileName].Location + '"'
        
        # Replace in content
        $oldContent = $content.Substring($roadsAvalonStart, $roadsAvalonEnd - $roadsAvalonStart)
        $content = $content.Replace($oldContent, $newLines)
        
        # Write back
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  Added translations successfully!"
    } else {
        Write-Host "  ERROR: Could not find roads_avalon in tagOptions"
    }
}

Write-Host "`nAll files processed!"
