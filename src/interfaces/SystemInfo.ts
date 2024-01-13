export interface Drive {
  drive: string;
  free_percentage: string;
  free: string;
  used: string;
}

export interface GeneralInfo {
  architecture: string;
  caption: string;
  computer_name: string;
  ram_memory: string;
  manufacturer: string;
  operating_system: string;
  processor: string;
  version: string;
  windows_directory: string;
}

export default interface SystemInfo {
  drives: Drive[];
  general_info: GeneralInfo;
}
