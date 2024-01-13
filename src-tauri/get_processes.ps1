function writeToProcessesFile {
    param (
        [Parameter(ValueFromPipeline=$true)]
        $info,
        [string]$processesFile
    )

    $info.Trim() | Out-File $processesFile -Append -Encoding UTF8
}
function getProcesses() {
    $systemTotalCPUTime = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue

    $processes = Get-Process | Group-Object -Property Name | ForEach-Object {
        $totalCPU = ($_.Group | Measure-Object CPU -Sum).Sum
        $memory = [math]::Floor(($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB)
        
        [PSCustomObject]@{
            Name = $_.Name
            Count = $_.Count
            TotalCPU = $totalCPU
            Memory = $memory
            CpuPercentage = [math]::Round((($totalCPU / 1000) / $systemTotalCPUTime) * 100, 1)
        }
    } | Sort-Object TotalCPU -Descending | Where-Object { $_.TotalCPU -gt 1 }

    $ramMemory = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)

    foreach ($process in $processes) {
        $totalProcessesCPUPercentage += $process.cpuPercentage
        $totalProcessesWorkingSet += $process.Memory
        "Process Group: $($process.Name)" | writeToProcessesFile -processesFile $processesFile
        "Process Count: $($process.Count)" | writeToProcessesFile -processesFile $processesFile
        "Total CPU Time: $([math]::Round($process.TotalCPU, 2)) seconds" | writeToProcessesFile -processesFile $processesFile
        "Total WS: $($process.Memory)MB" | writeToProcessesFile -processesFile $processesFile
        "CPU %: $($process.CpuPercentage)%" | writeToProcessesFile -processesFile $processesFile
        "--------------------------" | writeToProcessesFile -processesFile $processesFile
    }

    $totalProcessesCPUPercentage = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue)
    $totalUsedMemory = [math]::Round(((($processes | Measure-Object Memory -Sum).Sum / 1KB) / $ramMemory) * 100)

    "Total CPU usage: ${totalProcessesCPUPercentage}%" | writeToProcessesFile -processesFile $processesFile
    "Total memory usage: ${totalUsedMemory}%" | writeToProcessesFile -processesFile $processesFile
}

$processesFile = "processes.txt"
ni $processesFile -Force
getProcesses -processesFile $processesFile
