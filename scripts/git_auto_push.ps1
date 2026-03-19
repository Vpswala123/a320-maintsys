Write-Host "👀 Watching for changes..."
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = ".\src"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$action = {
  Start-Sleep 2
  git add .
  git commit -m "auto: changes at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  git push origin main
  Write-Host "✅ Pushed to GitHub"
}
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
while ($true) { Start-Sleep 1 }
