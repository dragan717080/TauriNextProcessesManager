#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::time::{SystemTime, UNIX_EPOCH};
use std::process::Command;
use tokio::time::{sleep, Duration};
use std::fs::File;
use std::io::{BufRead, BufReader, Error as IOError, ErrorKind};
use serde_json::{json, Value, to_string_pretty};

mod utils;
use utils::{convert_value_type, read_line_as_key_value_pair, push_lines_to_json_arr};

#[tokio::main]
async fn main() {
    // Instruct powershell to run script that writes
    write_to_file_in_powershell("get_system_info.ps1");
    // Files that change are added to .taurignore to avoid rebuilds
    let system_info: Value = read_system_info_file().unwrap();
/*     loop {
        // Sleep for 10 seconds before the next iteration
        let processes = read_processes_file().unwrap();
        tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info_data, 
            get_processes_data,
            stop_process
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
        sleep(Duration::from_secs(10)).await;
    } */
    let processes = read_processes_file().unwrap();
    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        get_system_info_data, 
        get_processes_data,
        stop_process
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn stop_process(process_name: String) {
    let command_output = Command::new("powershell")
        .arg("-Command")
        .arg(format!("Stop-Process -Name {}", process_name))
        .output()
        .expect("Failed to execute PowerShell command");

    if !command_output.status.success() {
        eprintln!(
            "Error executing PowerShell command: {}",
            String::from_utf8_lossy(&command_output.stderr)
        );
    }
}

#[tauri::command]
fn get_system_info_data() -> Value {
    write_to_file_in_powershell("get_processes.ps1");
    let system_info: Value = read_system_info_file().unwrap();
    system_info
}

#[tauri::command]
fn get_processes_data() -> Value {
    write_to_file_in_powershell("get_processes.ps1");
    let processes = read_processes_file().unwrap();
    processes
}

// Write to an output file with Powershell
fn write_to_file_in_powershell(script_path: &str) {
    // Use the Command struct to execute PowerShell Core
    let output = Command::new("powershell").arg("-File").arg(script_path).output();

    // Check if the command was successful
    match output {
        Ok(output) => {
            // Check for errors
            if !output.status.success() {
                eprintln!("Error executing script: {:?}", String::from_utf8_lossy(&output.stderr));
            }
            
        }
        Err(err) => {
            eprintln!("Error running command: {:?}", err);
        }
    }
}

fn read_system_info_file() -> Result<Value, IOError> {
    let file_path = "system_info.txt";
    let file = File::open(file_path)?;
    let reader = BufReader::new(file);

    let general_info_lines: Vec<String> = reader.lines().take(9).collect::<Result<_, _>>()?;

    let mut json_object = json!({});

    for line in general_info_lines {
        read_line_as_key_value_pair(&mut json_object, &line);
    }

    let mut result_json = json!({"general_info": json_object});

    let file = File::open(file_path)?;
    let reader = BufReader::new(file);

    let mut drive_info_lines = reader.lines().skip(9).filter_map(|line| Some(line));

    let mut drives_json_arr: Vec<Value> = Vec::new();

    while let Some(line1) = drive_info_lines.next() {
        if let Some(line2) = drive_info_lines.next() {
            if let Some(line3) = drive_info_lines.next() {
                if let Some(line4) = drive_info_lines.next() {
                    // This check is needed to obtain full data from all drives
                    if let Some(_) = drive_info_lines.next() {
                        drives_json_arr = push_lines_to_json_arr([line1.unwrap(), line2.unwrap(), line3.unwrap(), line4.unwrap()].to_vec(), drives_json_arr);
                    }
                    // Last drive doesn't have empty line at the end
                    else {
                        drives_json_arr = push_lines_to_json_arr([line1.unwrap(), line2.unwrap(), line3.unwrap(), line4.unwrap()].to_vec(), drives_json_arr);
                    }
                } else {
                    println!("Incomplete group of lines");
                    break;
                }
            }
        }
    }

    result_json["drives"] = Value::Array(drives_json_arr);

    Ok(result_json)
}

fn read_processes_file() -> Result<Value, IOError> {
    let file_path = "processes.txt";

    let file = File::open(file_path)?;
    let reader = BufReader::new(file);

    let mut process_groups_lines = reader.lines().filter_map(|line| Some(line));

    let mut result_json = json!({});
    let mut processes_json_arr: Vec<Value> = Vec::new();

    while let Some(line1) = process_groups_lines.next() {
        if let Some(line2) = process_groups_lines.next() {
            if let Some(line3) = process_groups_lines.next() {
                if let Some(line4) = process_groups_lines.next() {
                    if let Some(line5) = process_groups_lines.next() {
                        if let Some(_) = process_groups_lines.next() {   
                            processes_json_arr = push_lines_to_json_arr([line1.unwrap(), line2.unwrap(), line3.unwrap(), line4.unwrap(), line5.unwrap()].to_vec(), processes_json_arr);
                        }
                    }
                }
            }
            // Reached two lines that display total CPU usage and total memory usage
            else {
                read_line_as_key_value_pair(&mut result_json, &line1.as_ref().unwrap());
                read_line_as_key_value_pair(&mut result_json, &line2.as_ref().unwrap());
            }
        }
    }

    // Remove bite order marks from file
    result_json["processes"] = Value::Array(processes_json_arr);
    let key_prefix_to_remove = '\u{feff}';
    let mut keys_to_remove = Vec::new();
    let mut keys_to_add = Vec::new();

    if let Some(process) = result_json["processes"][0].as_object() {
        for (k, _) in process.iter() {
            if k.chars().nth(0).unwrap() == key_prefix_to_remove {
                let new_key = &k[3..];
                keys_to_remove.push(k.to_string());
                keys_to_add.push(new_key.to_owned());
            }
        }

        // Remove the keys from the original object
        if let Some(obj) = result_json["processes"][0].as_object_mut() {
            for (index, key) in keys_to_remove.into_iter().enumerate() {
                let new_key = &keys_to_add[index];
                obj.insert(new_key.to_string(), obj.get(&key).unwrap().clone());
                obj.remove(&key);
            }
        } else {
            println!("Not an object");
        }
    } else {
        println!("Not an object");
    }

    Ok(result_json)
}
