# Set output encoding to UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Color definitions (compatible with PowerShell 5.1 and 7.x)
$ESC = [char]27
$RED = "$ESC[31m"
$GREEN = "$ESC[32m"
$YELLOW = "$ESC[33m"
$BLUE = "$ESC[34m"
$NC = "$ESC[0m"

# Try to resize terminal window to 120x40 (columns x rows) on startup
# If unsupported or fails, silently ignore to avoid affecting main script
function Try-ResizeTerminalWindow {
    param(
        [int]$Columns = 120,
        [int]$Rows = 40
    )

    # Method 1: Adjust via PowerShell Host RawUI (traditional console, ConEmu, etc.)
    try {
        $rawUi = $null
        if ($Host -and $Host.UI -and $Host.UI.RawUI) {
            $rawUi = $Host.UI.RawUI
        }

        if ($rawUi) {
            try {
                # BufferSize must be >= WindowSize
                $bufferSize = $rawUi.BufferSize
                $newBufferSize = New-Object System.Management.Automation.Host.Size (
                    ([Math]::Max($bufferSize.Width, $Columns)),
                    ([Math]::Max($bufferSize.Height, $Rows))
                )
                $rawUi.BufferSize = $newBufferSize
            } catch {}

            try {
                $rawUi.WindowSize = New-Object System.Management.Automation.Host.Size ($Columns, $Rows)
            } catch {}
        }
    } catch {}

    # Method 2: Try ANSI escape sequence (Windows Terminal, etc.)
    try {
        if (-not [Console]::IsOutputRedirected) {
            $escChar = [char]27
            [Console]::Out.Write("$escChar[8;${Rows};${Columns}t")
        }
    } catch {}
}

Try-ResizeTerminalWindow -Columns 120 -Rows 40

# Path resolution: prefer .NET to avoid issues with missing environment variables
function Get-FolderPathSafe {
    param(
        [Parameter(Mandatory = $true)][System.Environment+SpecialFolder]$SpecialFolder,
        [Parameter(Mandatory = $true)][string]$EnvVarName,
        [Parameter(Mandatory = $true)][string]$FallbackRelative,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $path = [Environment]::GetFolderPath($SpecialFolder)

    if ([string]::IsNullOrWhiteSpace($path)) {
        $envValue = [Environment]::GetEnvironmentVariable($EnvVarName)
        if (-not [string]::IsNullOrWhiteSpace($envValue)) {
            $path = $envValue
        }
    }

    if ([string]::IsNullOrWhiteSpace($path)) {
        $userProfile = [Environment]::GetFolderPath([System.Environment+SpecialFolder]::UserProfile)
        if ([string]::IsNullOrWhiteSpace($userProfile)) {
            $userProfile = [Environment]::GetEnvironmentVariable("USERPROFILE")
        }
        if (-not [string]::IsNullOrWhiteSpace($userProfile)) {
            $path = Join-Path $userProfile $FallbackRelative
        }
    }

    if ([string]::IsNullOrWhiteSpace($path)) {
        Write-Host "$YELLOW⚠️  [PATH]$NC $Label could not be resolved, trying fallback"
    } else {
        Write-Host "$BLUEℹ️  [PATH]$NC ${Label}: $path"
    }

    return $path
}