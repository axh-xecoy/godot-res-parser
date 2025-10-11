/**
 * Godot Resource Parser - 简单演示
 * 
 * 这是一个最简单的演示示例，展示库的基本编解码功能
 */

import { resDataToJsonString, jsonStringToResData, setDebugMode } from '../godot_res.js';
import fs from 'fs';

// 关闭调试模式，保持输出清洁
setDebugMode(false);

console.log('🎮 Godot Resource Parser - 简单演示\n');

// 使用最简单的资源结构
const simpleResource = {
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
        "test_property"
    ],
    "externalResources": [],
    "internalResources": [],
    "resourceData": {
        "type": "Resource",
        "properties": {
            "test_property": "Hello, Godot!"
        }
    }
};

console.log('📝 演示: 简单的编码和解码过程');

try {
    // 步骤1: 准备JSON数据
    const jsonString = JSON.stringify(simpleResource, null, 2);
    console.log(`1️⃣ 准备JSON数据: ${jsonString.length} 字符`);
    
    // 步骤2: 编码为二进制
    console.log('2️⃣ 编码为二进制格式...');
    const binaryData = jsonStringToResData(jsonString);
    console.log(`   ✅ 编码成功: ${binaryData.length} 字节`);
    
    // 步骤3: 解码回JSON
    console.log('3️⃣ 解码回JSON格式...');
    const decodedJson = resDataToJsonString(binaryData);
    console.log(`   ✅ 解码成功: ${decodedJson.length} 字符`);
    
    // 步骤4: 验证数据
    console.log('4️⃣ 验证数据完整性...');
    const decodedData = JSON.parse(decodedJson);
    
    const originalValue = simpleResource.resourceData.properties.test_property;
    const decodedValue = decodedData.resourceData.properties.test_property;
    
    if (originalValue === decodedValue) {
        console.log(`   ✅ 验证通过: "${originalValue}" === "${decodedValue}"`);
    } else {
        console.log(`   ❌ 验证失败: "${originalValue}" !== "${decodedValue}"`);
    }
    
    console.log('\n🎉 演示完成！编解码功能正常工作。');
    
} catch (error) {
    console.error('❌ 演示失败:', error.message);
    console.log('\n💡 提示: 这可能是由于数据格式不兼容导致的。');
    console.log('   请检查您的Godot版本和资源格式是否匹配。');
}

console.log('\n📚 了解更多:');
console.log('   - 运行 node examples/basic-usage.js 查看详细示例');
console.log('   - 运行 node examples/file-conversion.js 进行文件转换');
console.log('   - 查看 examples/README.md 获取完整文档');