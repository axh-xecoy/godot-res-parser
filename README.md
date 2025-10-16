# Godot Resource Parser

A JavaScript library for encoding and decoding Godot `.res` resource files. This library allows you to convert between Godot's binary resource format and JSON for easy manipulation and analysis.

 

## Features

- 🔄 Bidirectional conversion: Convert `.res` files to JSON and back
- 📦 Resource coverage: Headers, string tables, external/internal resources, resource data
- 🚀 ES Module support: Modern JavaScript module system
- 🛠️ TypeScript types: `index.d.ts`
- 🎯 Zero dependencies: Pure JavaScript implementation

## Installation

Add Git dependency in `package.json`:

```json
{
  "dependencies": {
    "godot-res-parser": "github:axh-xecoy/godot-res-parser"
  }
}
```

Alternatively, install via command:

```bash
npm install github:axh-xecoy/godot-res-parser
```

## Quick Start

```javascript
import {
  resDataToJsonString,
  jsonStringToResData,
  setDebugMode,
  CompleteResourceParser,
  CompleteResourceEncoder
} from 'godot-res-parser';
import fs from 'fs';

// Decode .res file to JSON
const resData = fs.readFileSync('save.res');
const jsonString = resDataToJsonString(resData);
const parsedData = JSON.parse(jsonString);

// Encode JSON back to .res file
const newResData = jsonStringToResData(jsonString);
fs.writeFileSync('output.res', newResData);
```

## API Reference

### Main Functions

#### `resDataToJsonString(resData: Uint8Array): string`

Converts Godot `.res` binary data to JSON string.

- Parameters:
  - `resData`: Uint8Array containing the binary .res file data
- Returns: JSON string representation of the resource

#### `jsonStringToResData(jsonString: string): Uint8Array`

Converts JSON string back to Godot `.res` binary format.

- Parameters:
  - `jsonString`: JSON string representation of the resource
- Returns: Uint8Array containing the binary .res data

#### `setDebugMode(enabled: boolean, logger?: function)`

Enables or disables debug logging.

- Parameters:
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
  "stringTable": ["resource_local_to_scene", "resource_name", "..."],
  "externalResources": ["..."],
  "internalResources": ["..."],
  "resourceData": {
    "type": "Resource",
    "properties": {
      "property_name": "property_value"
    }
  }
}
```

## Examples

Run local examples:

```bash
node examples/basic-usage.js
node examples/file-conversion.js
node examples/simple-demo.js
```

## Notes & Compatibility

- The library targets the Godot 4 resource format. Broader compatibility is a work-in-progress.
- If you hit any format differences, please open an issue with sample files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.