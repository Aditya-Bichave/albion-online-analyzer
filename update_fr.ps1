$content = Get-Content 'Z:\Projects\Apps\Mvp project\ao-pocket\messages\fr.json' -Raw
$pattern = '      "roads_avalon": "Routes d''Avalon"'
$replacement = '      "roads_avalon": "Routes d''Avalon",' + "`r`n" + '      "other_activity": "Autre Activité",' + "`r`n" + '      "other_location": "Autre Lieu"'
$content = $content -replace $pattern, $replacement
[System.IO.File]::WriteAllText('Z:\Projects\Apps\Mvp project\ao-pocket\messages\fr.json', $content, [System.Text.UTF8Encoding]::new($false))
Write-Host "French file updated successfully"
