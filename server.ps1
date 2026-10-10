$port = 8080
$path = $PSScriptRoot
if (-not $path) { $path = Split-Path -Parent $MyInvocation.MyCommand.Path }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Photobooth server running at http://localhost:$port/" -ForegroundColor Green
Start-Process "http://localhost:$port/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($urlPath)) { 
            $urlPath = 'index.html' 
        }

        $filePath = Join-Path $path $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = 'text/plain'
            if ($ext -eq '.html') { $contentType = 'text/html; charset=utf-8' }
            elseif ($ext -eq '.css') { $contentType = 'text/css; charset=utf-8' }
            elseif ($ext -eq '.js') { $contentType = 'application/javascript; charset=utf-8' }
            elseif ($ext -eq '.png') { $contentType = 'image/png' }
            elseif ($ext -eq '.jpg' -or $ext -eq '.jpeg') { $contentType = 'image/jpeg' }
            elseif ($ext -eq '.mp3') { $contentType = 'audio/mpeg' }

            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # continue loop
    }
}
