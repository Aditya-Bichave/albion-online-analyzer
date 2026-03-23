# Script to add translations to BuildView.tagOptions section
# Adds other_activity and other_location after the "Other" entry

$basePath = 'Z:\Projects\Apps\Mvp project\ao-pocket\messages\'

# Define translations and line numbers for each language
$files = @(
    @{File='de.json'; Line=2472; Activity='Andere Aktivität'; Location='Anderer Ort'},
    @{File='es.json'; Line=2316; Activity='Otra Actividad'; Location='Otra Ubicación'},
    @{File='fr.json'; Line=2642; Activity='Autre Activité'; Location='Autre Lieu'},
    @{File='pt.json'; Line=2500; Activity='Outra Atividade'; Location='Outro Local'},
    @{File='ru.json'; Line=2642; Activity='Другое занятие'; Location='Другое место'},
    @{File='ko.json'; Line=2642; Activity='기타 활동'; Location='기타 지역'},
    @{File='zh.json'; Line=2438; Activity='其他活动'; Location='其他地点'},
    @{File='pl.json'; Line=2642; Activity='Inna Aktywność'; Location='Inna Lokalizacja'},
    @{File='tr.json'; Line=2643; Activity='Diğer Aktivite'; Location='Diğer Konum'}
)

foreach ($info in $files) {
    $filePath = $basePath + $info.File
    Write-Host "Processing $($info.File)..."
    
    # Read all lines
    $lines = Get-Content $filePath
    
    # Get the line index (0-based)
    $lineIndex = $info.Line - 1
    
    # Check if the line contains "Other"
    if ($lines[$lineIndex] -match '"Other":') {
        Write-Host "  Found 'Other' at line $($info.Line)"
        
        # Add comma to the end of the Other line if it doesn't have one
        $otherLine = $lines[$lineIndex].TrimEnd()
        if (-not $otherLine.EndsWith(',')) {
            $otherLine = $otherLine + ','
        }
        $lines[$lineIndex] = $otherLine
        
        # Create new lines to insert
        $newLines = @(
            '      "other_activity": "' + $info.Activity + '",',
            '      "other_location": "' + $info.Location + '"'
        )
        
        # Insert new lines after the Other line
        $result = @()
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $result += $lines[$i]
            if ($i -eq $lineIndex) {
                $result += $newLines
            }
        }
        
        # Write back
        [System.IO.File]::WriteAllLines($filePath, $result, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  Added translations successfully!"
    } else {
        Write-Host "  ERROR: Line $($info.Line) does not contain 'Other': $($lines[$lineIndex])"
    }
}

Write-Host "`nAll files processed!"
