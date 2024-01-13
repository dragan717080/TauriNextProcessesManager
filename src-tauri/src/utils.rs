use serde_json::{json, Value};

pub fn convert_value_type(value: &str) -> Value {
    // Try to parse as f64
    if let Ok(float_value) = value.parse::<f64>() {
        return Value::Number(serde_json::Number::from_f64(float_value).unwrap());
    }

    // Try to parse as i64
    if let Ok(int_value) = value.parse::<i64>() {
        return Value::Number(serde_json::Number::from(int_value));
    }

    // If parsing as f64 or i64 fails, keep it as a string
    Value::String(value.to_string())
}

pub fn read_line_as_key_value_pair(json_object: &mut Value, line: &str) -> Value {
    let parts: Vec<&str> = line.splitn(2, ':').map(|s| s.trim()).collect();

    if parts.len() == 2 {
        let key = parts[0];
        let value = parts[1];

        // Insert key-value pair into the JSON object
        json_object[key] = convert_value_type(value);
    }

    json_object.to_owned()
}

pub fn push_lines_to_json_arr(lines: Vec<String>, mut result_json_arr: Vec<Value>) -> Vec<Value> {
    let mut json_object: Value = json!({});
    for (index, line) in lines.iter().enumerate() {
        let updated_json_value = read_line_as_key_value_pair(&mut json_object, &line.as_str());
        if index == lines.len() - 1 {
            result_json_arr.push(updated_json_value);
        }
    }
    result_json_arr
}
