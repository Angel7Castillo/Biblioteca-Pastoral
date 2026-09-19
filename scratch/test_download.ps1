$urlRVR1960 = "https://mrk214.github.io/snapshots/es___spa___spa/RVR1960_vid_149.json"
$urlNVI     = "https://mrk214.github.io/snapshots/es___spa___spa/NVI_vid_128.json"
$urlTLA     = "https://mrk214.github.io/snapshots/es___spa___spa/TLAI_vid_178.json"

Write-Host "Checking RVR1960..."
$req = Invoke-WebRequest -Uri $urlRVR1960 -UseBasicParsing
Write-Host "RVR1960 size: $($req.Content.Length) bytes"
Write-Host "Sample snippet:"
Write-Host $req.Content.Substring(0, 400)
