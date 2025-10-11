/**
 * Godot Resource Parser - 基本使用示例
 * 
 * 本示例展示如何使用 godot-res-parser 库进行基本的编码和解码操作
 */

import { resDataToJsonString, jsonStringToResData, setDebugMode } from '../godot_res.js';
import fs from 'fs';

// 启用调试模式（可选）
setDebugMode(false); // 关闭调试模式，保持输出清洁

console.log('🎮 Godot Resource Parser - 基本使用示例\n');

// 示例1: 从JSON字符串编码为二进制数据
console.log('📝 示例1: JSON -> 二进制编码');

const sampleResourceData = {
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
    "stringTable": [
        "resource_local_to_scene",
        "resource_name",
        "example_property",
        "number_value",
        "boolean_value", 
        "array_value"
    ],
    "externalResources": [],
    "internalResources": [],
    "resourceData": {
        "type": "Resource",
        "properties": {
            "example_property": "Hello from Godot Resource Parser!",
            "number_value": 42,
            "boolean_value": true,
            "array_value": [1, 2, 3, "test"]
        }
    }
};

try {
    const jsonString = JSON.stringify(sampleResourceData, null, 2);
    console.log(`输入JSON大小: ${jsonString.length} 字符`);
    
    // 编码为二进制
    const binaryData = jsonStringToResData(jsonString);
    console.log(`编码后大小: ${binaryData.length} 字节`);
    
    // 保存到文件
    fs.writeFileSync('example_output.res', binaryData);
    console.log('✅ 编码完成，已保存到 example_output.res\n');
    
} catch (error) {
    console.error('❌ 编码失败:', error.message);
}

// 示例2: 从二进制数据解码为JSON
console.log('📖 示例2: 二进制 -> JSON解码');

try {
    // 读取二进制文件
    const binaryData = fs.readFileSync('example_output.res');
    console.log(`输入二进制大小: ${binaryData.length} 字节`);
    
    // 解码为JSON
    const decodedJson = resDataToJsonString(binaryData);
    console.log(`解码后大小: ${decodedJson.length} 字符`);
    
    // 保存解码结果
    fs.writeFileSync('example_decoded.json', decodedJson);
    console.log('✅ 解码完成，已保存到 example_decoded.json');
    
    // 验证数据完整性
    const decodedData = JSON.parse(decodedJson);
    const originalProperty = sampleResourceData.resourceData.properties.example_property;
    const decodedProperty = decodedData.resourceData.properties.example_property;
    
    if (originalProperty === decodedProperty) {
        console.log('✅ 数据完整性验证通过');
    } else {
        console.log('❌ 数据完整性验证失败');
    }
    
} catch (error) {
    console.error('❌ 解码失败:', error.message);
}

// 清理示例文件
console.log('\n🧹 清理示例文件...');
try {
    fs.unlinkSync('example_output.res');
    fs.unlinkSync('example_decoded.json');
    console.log('✅ 清理完成');
} catch (error) {
    console.log('⚠️  清理时出现问题:', error.message);
}

console.log('\n🎉 基本使用示例完成！');