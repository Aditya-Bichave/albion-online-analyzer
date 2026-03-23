# Script to add translations to BuildView.tagOptions section in all language files
# Uses proper UTF-8 encoding

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

    try {
        # Read file content
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Find and replace in tagOptions section within BuildView
        # Match the "Other": "..." line and add new entries after it
        $pattern = '(("Other":\s*"[^"]*")\s*,?\s*)(})'
        
        $replacement = '$1      "other_activity": "' + $translations[$fileName].Activity + '",`n      "other_location": "' + $translations[$fileName].Location + '"`n    $3'
        
        $newContent = $content -replace $pattern, $replacement
        
        if ($newContent -ne $content) {
            # Write back with UTF-8 encoding (no BOM)
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($filePath, $newContent, $utf8NoBom)
            Write-Host "  ✓ Added translations successfully!"
        } else {
            Write-Host "  ⚠ No changes made - pattern not found"
        }
    }
    catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)"
    }
}

Write-Host "`nAll files processed!"
