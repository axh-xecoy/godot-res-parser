# Godot Resource Parser

A JavaScript library for encoding and decoding Godot `.res` resource files. This library allows you to convert between Godot's binary resource format and JSON for easy manipulation and analysis.

## Features

- 🔄 **Bidirectional conversion**: Convert `.res` files to JSON and back
- 📦 **Complete resource support**: Handles headers, string tables, external resources, and resource data
- 🚀 **ES Module support**: Modern JavaScript module system
- 🛠️ **TypeScript ready**: Includes type definitions
- 🎯 **Zero dependencies**: Pure JavaScript implementation

## Installation

```bash
npm install godot-res-parser
```

## Quick Start

### Basic Usage

```javascript
import { resDataToJsonString, jsonStringToResData } from 'godot-res-parser';
import fs from 'fs';

// Decode .res file to JSON
const resData = fs.readFileSync('save.res');
const jsonString = resDataToJsonString(resData);
const parsedData = JSON.parse(jsonString);

// Encode JSON back to .res file
const newResData = jsonStringToResData(jsonString);
fs.writeFileSync('output.res', newResData);
```

### Advanced Usage

```javascript
import { 
  CompleteResourceParser, 
  CompleteResourceEncoder,
  setDebugMode 
} from 'godot-res-parser';

// Enable debug mode for detailed logging
setDebugMode(true);

// Use parser directly for more control
const parser = new CompleteResourceParser();
parser.setBuffer(Buffer.from(resData));
const result = parser.parseComplete();

// Use encoder directly
const encoder = new CompleteResourceEncoder();
const buffer = encoder.encode(data);
```

## API Reference

### Main Functions

#### `resDataToJsonString(resData: Uint8Array): string`

Converts Godot `.res` binary data to JSON string.

- **Parameters:**
  - `resData`: Uint8Array containing the binary .res file data
- **Returns:** JSON string representation of the resource

#### `jsonStringToResData(jsonString: string): Uint8Array`

Converts JSON string back to Godot `.res` binary format.

- **Parameters:**
  - `jsonString`: JSON string representation of the resource
- **Returns:** Uint8Array containing the binary .res data

#### `setDebugMode(enabled: boolean, logger?: function)`

Enables or disables debug logging.

- **Parameters:**
  - `enabled`: Whether to enable debug mode
  - `logger`: Optional custom logger function (defaults to console.log)

### Classes

#### `CompleteResourceParser`

Low-level parser for Godot resources.

```javascript
const parser = new CompleteResourceParser();
parser.setBuffer(buffer);
const result = parser.parseComplete();
```

#### `CompleteResourceEncoder`

Low-level encoder for Godot resources.

```javascript
const encoder = new CompleteResourceEncoder();
const buffer = encoder.encode(data);
```

## Resource Structure

The JSON representation follows this structure:

```json
{
  "header": {
    "magic": "RSRC",
    "bigEndian": false,
    "useReal64": false,
    "verMajor": 4,
    "verMinor": 5,
    "verFormat": 6,
    "resourceType": "Resource",
    "importMetadataOffset": "0",
    "flags": 11,
    "uid": "18446744073709551615",
    "scriptClass": "",
    "hasNamedSceneIds": true,
    "hasUids": true,
    "hasScriptClass": false,
    "realTIsDouble": false
  },
  "stringTable": ["resource_local_to_scene", "resource_name", ...],
  "externalResources": [...],
  "internalResources": [...],
  "resourceData": {
    "type": "Resource",
    "properties": {
      "property_name": "property_value",
      ...
    }
  }
}
```

## Command Line Tools

You can also use the library via command line:

### Encoding (JSON to .res)

```bash
node encode.js input.json output.res
```

### Decoding (.res to JSON)

```bash
node decode.js input.res output.json
```

## Examples

### Working with Save Files

```javascript
import { resDataToJsonString, jsonStringToResData } from 'godot-res-parser';
import fs from 'fs';

// Load and parse a Godot save file
const saveData = fs.readFileSync('user://save.res');
const saveJson = JSON.parse(resDataToJsonString(saveData));

// Modify player data
saveJson.resourceData.properties.playerLevel = 99;
saveJson.resourceData.properties.playerGold = 999999;

// Save back to .res format
const modifiedSave = jsonStringToResData(JSON.stringify(saveJson));
fs.writeFileSync('modified_save.res', modifiedSave);
```

### Resource Analysis

```javascript
import { resDataToJsonString } from 'godot-res-parser';

function analyzeResource(resPath) {
  const data = fs.readFileSync(resPath);
  const json = JSON.parse(resDataToJsonString(data));
  
  console.log('Resource Type:', json.header.resourceType);
  console.log('Godot Version:', `${json.header.verMajor}.${json.header.verMinor}`);
  console.log('Properties:', Object.keys(json.resourceData.properties));
  console.log('External Resources:', json.externalResources.length);
}
```

## Supported Godot Versions

- Godot 4.x (primary support)
- Godot 3.x (limited support)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Changelog

### 1.0.0
- Initial release
- Support for basic .res file parsing and encoding
- ES Module support
- Command line tools