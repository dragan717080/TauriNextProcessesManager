function writeToSystemInfoFile {
    param (
        [Parameter(ValueFromPipeline=$true)]
        $info,
        [string]$systemInfoFile
    )

    $info.Trim() | Out-File $systemInfoFile -Append -Encoding UTF8
}

function getAllSystemInfo {
    $result = gin
    $result.PSObject.Properties | ForEach-Object {
        $key = $_.Name

        try {
            $value = $_.Value.ToString().Trim()
            write-output "${key}: $value" | Out-File $systemInfoFile -Append -Encoding UTF8
        } 
        catch {
            "Error: $_"
            "Error for key: $key, value: $value"
        }
    }
}

function getOperatingSystemInfo {
    (Get-CimInstance Win32_OperatingSystem `
        | Format-List @{ Name="Operating System"; Expression={ $_.Caption } }, Version, `
        @{ Name="Architecture"; Expression={ $_.OSArchitecture } }, `
        @{ Name="Computer Name"; Expression={ $_.CSName } }, `
        @{ Name="Windows Directory"; Expression={ $_.WindowsDirectory } } | Out-String) `
        | writeToSystemInfoFile -systemInfoFile $systemInfoFile
    "Installed memory (RAM): $([math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB))GB" `
        | writeToSystemInfoFile -systemInfoFile $systemInfoFile
}

function getProcessorInfo {
    (Get-CimInstance Win32_Processor | Format-List @{ Name = "Processor"; Expression = { $_.Name } }, `
    Caption, Manufacturer| Out-String) `
    | writeToSystemInfoFile -systemInfoFile $systemInfoFile
}

function getDrivesInfo {
    (Get-PSDrive -PSProvider FileSystem | Format-List `
    @{ Name="Drive"; Expression={ $_.Root } }, `
    @{ Name="Used (GB)"; Expression={ [math]::Round($_.Used / 1GB, 2) } }, `
    @{ Name="Free (GB)"; Expression={ [math]::Round($_.Free / 1GB, 2) } }, `
    @{ Name="Free %"; Expression={ [math]::Round(($_.Free / ($_.Free + $_.Used)) * 100, 2) } } `
        | Out-String) `
        | writeToSystemInfoFile -systemInfoFile $systemInfoFile
}

$systemInfoFile = "system_info.txt"
ni $systemInfoFile -Force
getOperatingSystemInfo
getProcessorInfo
getDrivesInfo
