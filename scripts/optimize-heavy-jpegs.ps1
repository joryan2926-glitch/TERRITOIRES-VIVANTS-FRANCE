$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" } |
  Select-Object -First 1

if (-not $jpegCodec) {
  throw "JPEG codec introuvable."
}

$qualityParam = [System.Drawing.Imaging.Encoder]::Quality
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($qualityParam, [int64]82)

$optimized = 0
$savedBytes = 0

Get-ChildItem -Path (Join-Path $root "assets") -Recurse -File -Include *.jpg,*.jpeg |
  Where-Object { $_.Length -gt 250KB } |
  ForEach-Object {
    $file = $_.FullName
    $tmp = "$file.tmp.jpg"
    $originalLength = $_.Length
    $image = $null
    try {
      $image = [System.Drawing.Image]::FromFile($file)
      $image.Save($tmp, $jpegCodec, $encoderParams)
    } finally {
      if ($image) {
        $image.Dispose()
      }
    }

    $tmpInfo = Get-Item $tmp
    if ($tmpInfo.Length -lt $originalLength) {
      Move-Item -LiteralPath $tmp -Destination $file -Force
      $optimized += 1
      $savedBytes += ($originalLength - $tmpInfo.Length)
      Write-Host ("Optimized {0}: {1} KB saved" -f (Resolve-Path -Relative $file), [math]::Round(($originalLength - $tmpInfo.Length) / 1KB))
    } else {
      Remove-Item -LiteralPath $tmp -Force
      Write-Host ("Skipped {0}: no gain" -f (Resolve-Path -Relative $file))
    }
  }

Write-Host ("JPEG optimization complete: {0} files, {1} KB saved" -f $optimized, [math]::Round($savedBytes / 1KB))
