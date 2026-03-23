# Script to fix the translations formatting - put each on its own line

$basePath = 'Z:\Projects\Apps\Mvp project\ao-pocket\messages\'

$files = @(
    'de.json', 'es.json', 'fr.json', 'pt.json', 'ru.json', 'ko.json', 'zh.json', 'pl.json', 'tr.json'
)

foreach ($fileName in $files) {
    $filePath = $basePath + $fileName
    Write-Host "Fixing $fileName..."
    
    # Read as raw text
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.UTF8Encoding]::new($false))
    
    # Find and replace the pattern where both are on same line
    # Pattern: "other_activity": "...",       "other_location": "..."
    # Replace with proper newlines
    
    $content = $content -replace '("other_activity": "[^"]+",)\s+("other_location": "[^"]+")', "`$1`r`n      `$2"
    
    # Write back
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  Fixed!"
}

Write-Host "`nAll files fixed!"
