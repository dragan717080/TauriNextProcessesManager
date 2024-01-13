export interface Process {
  CPU: string;
  total_CPU_time: string;
  memory: string;
  process_group: string;
  cpu_percentage: string;
}

export default interface Processes {
  total_cpu_usage: string;
  total_memory_usage: string;
  processes: Process[];
}
