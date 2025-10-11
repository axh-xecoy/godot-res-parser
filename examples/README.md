# Godot Resource Parser - 使用示例

本目录包含了 `godot-res-parser` 库的各种使用示例，帮助您快速上手和理解库的功能。

## 📁 示例文件

### 1. `basic-usage.js` - 基本使用示例
展示库的核心功能：
- JSON 到二进制数据的编码
- 二进制数据到 JSON 的解码
- 数据完整性验证
- 调试模式的使用

**运行方式：**
```bash
node examples/basic-usage.js
```

### 2. `file-conversion.js` - 文件转换示例
展示文件格式转换功能：
- `.res` 文件转换为 `.json` 文件
- `.json` 文件转换为 `.res` 文件
- 批量文件转换
- 往返转换测试

**运行方式：**
```bash
node examples/file-conversion.js
```

## 🚀 快速开始

1. **安装依赖**（如果需要）：
   ```bash
   npm install
   ```

2. **运行基本示例**：
   ```bash
   node examples/basic-usage.js
   ```

3. **准备测试文件**：
   - 将一些 `.res` 文件放在项目根目录
   - 运行文件转换示例：
     ```bash
     node examples/file-conversion.js
     ```

## 📋 示例说明

### 基本数据结构

所有的 Godot 资源文件都遵循以下 JSON 结构：

```json
{
  "header": {
    "magic": "RSRC",
    "bigEndian": false,
    "verMajor": 4,
    "verMinor": 5,
    "verFormat": 6,
    "resourceType": "Resource",
    // ... 其他头部信息
  },
  "stringTable": ["字符串1", "字符串2", ...],
  "externalResources": [...],
  "internalResources": [...],
  "resourceData": {
    "type": "Resource",
    "properties": {
      // 资源的实际数据
    }
  }
}
```

### 常用操作

1. **编码操作**：
   ```javascript
   import { jsonStringToResData } from '../godot_res.js';
   
   const jsonString = JSON.stringify(resourceData);
   const binaryData = jsonStringToResData(jsonString);
   ```

2. **解码操作**：
   ```javascript
   import { resDataToJsonString } from '../godot_res.js';
   
   const jsonString = resDataToJsonString(binaryData);
   const resourceData = JSON.parse(jsonString);
   ```

3. **调试模式**：
   ```javascript
   import { setDebugMode } from '../godot_res.js';
   
   setDebugMode(true); // 启用详细日志
   ```

## 🔧 自定义示例

您可以基于这些示例创建自己的转换脚本：

```javascript
import { resDataToJsonString, jsonStringToResData } from '../godot_res.js';
import fs from 'fs';

// 您的自定义逻辑
function myCustomConverter(inputFile, outputFile) {
    // 实现您的转换逻辑
}
```

## 📝 注意事项

1. **文件格式**：确保输入的 JSON 文件符合 Godot 资源的结构要求
2. **错误处理**：在生产环境中，请添加适当的错误处理逻辑
3. **性能**：对于大文件，考虑使用流式处理或分块处理
4. **兼容性**：确保 Godot 版本兼容性，不同版本可能有格式差异

## 🆘 获取帮助

如果您在使用过程中遇到问题：

1. 查看 [README.md](../README.md) 中的 API 文档
2. 检查示例代码中的错误处理部分
3. 启用调试模式查看详细日志
4. 在项目仓库中提交 Issue

## 🎯 更多示例

如果您需要更多特定场景的示例，欢迎：
- 提交 Issue 描述您的需求
- 贡献您自己的示例代码
- 查看项目文档中的高级用法