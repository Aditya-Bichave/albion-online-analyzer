# Script to add translations to BuildView.tagOptions section in all language files

$files = @(
    @{Path='de.json'; Road='Straßen von Avalon'; Activity='Andere Aktivität'; Location='Anderer Ort'},
    @{Path='es.json'; Road='Caminos de Avalon'; Activity='Otra Actividad'; Location='Otra Ubicación'},
    @{Path='fr.json'; Road='Routes d''Avalon'; Activity='Autre Activité'; Location='Autre Lieu'},
    @{Path='pt.json'; Road='Estradas de Avalon'; Activity='Outra Atividade'; Location='Outro Local'},
    @{Path='ru.json'; Road='Дороги Авалона'; Activity='Другое занятие'; Location='Другое место'},
    @{Path='ko.json'; Road='아발론의 길'; Activity='기타 활동'; Location='기타 지역'},
    @{Path='zh.json'; Road='阿瓦隆之路'; Activity='其他活动'; Location='其他地点'},
    @{Path='pl.json'; Road='Drogi Avalonu'; Activity='Inna Aktywność'; Location='Inna Lokalizacja'},
    @{Path='tr.json'; Road='Avalon Yolları'; Activity='Diğer Aktivite'; Location='Diğer Konum'}
)

$basePath = 'Z:\Projects\Apps\Mvp project\ao-pocket\messages\'

foreach ($file in $files) {
    $filePath = $basePath + $file.Path
    Write-Host "Processing $($file.Path)..."
    
    # Read the file
    $content = Get-Content $filePath -Raw
    
    # Pattern to match roads_avalon at end of tagOptions (followed by newline and closing brace)
    # This specifically targets the BuildView.tagOptions section
    $pattern = '(      "roads_avalon": "' + $file.Road + '")(\r?\n)(    },)'
    $replacement = '$1,' + "`r`n" + '      "other_activity": "' + $file.Activity + '",' + "`r`n" + '      "other_location": "' + $file.Location + '"' + "`r`n" + '$3'
    
    $newContent = $content -replace $pattern, $replacement
    
    # Write back
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  Done!"
}

Write-Host "`nAll files processed!"
