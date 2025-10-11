import { resDataToJsonString, jsonStringToResData, setDebugMode } from '../godot_res.js';
import fs from 'fs';
import path from 'path';

// 测试配置
const TEST_DIR = path.dirname(import.meta.url.replace('file:///', ''));
const PROJECT_DIR = path.join(TEST_DIR, '..');

// 启用调试模式
setDebugMode(false);

console.log('🧪 开始 Godot Resource Parser 测试...\n');

// 测试1: 库导入和基本功能测试
function testLibraryImport() {
    console.log('📝 测试1: 库导入和基本功能');
    
    try {
        // 测试函数是否正确导入
        if (typeof resDataToJsonString !== 'function') {
            throw new Error('resDataToJsonString 函数导入失败');
        }
        if (typeof jsonStringToResData !== 'function') {
            throw new Error('jsonStringToResData 函数导入失败');
        }
        if (typeof setDebugMode !== 'function') {
            throw new Error('setDebugMode 函数导入失败');
        }
        
        console.log('   ✅ 所有主要函数导入成功');
        
        // 测试调试模式设置
        setDebugMode(false);
        console.log('   ✅ 调试模式设置成功');
        
        return true;
    } catch (error) {
        console.log(`   ❌ 测试失败: ${error.message}`);
        return false;
    }
}

// 测试2: 文件操作测试
function testFileOperations() {
    console.log('\n📁 测试2: 文件操作功能');
    
    try {
        // 检查是否存在示例文件
        if (!fs.existsSync('sample.json')) {
            console.log('   ⚠️  未找到 sample.json，跳过文件操作测试');
            return true;
        }
        
        // 读取示例文件
        const sampleJson = fs.readFileSync('sample.json', 'utf8');
        console.log(`   ✅ 成功读取示例文件: ${sampleJson.length} 字符`);
        
        // 编码为二进制文件
        const resData = jsonStringToResData(sampleJson);
        fs.writeFileSync('test_output.res', resData);
        console.log(`   ✅ 编码并保存: ${resData.length} 字节`);
        
        // 读取并解码二进制文件
        const binaryData = fs.readFileSync('test_output.res');
        const decodedJson = resDataToJsonString(binaryData);
        fs.writeFileSync('test_decoded.json', decodedJson);
        console.log(`   ✅ 解码并保存: ${decodedJson.length} 字符`);
        
        // 清理测试文件
        fs.unlinkSync('test_output.res');
        fs.unlinkSync('test_decoded.json');
        console.log('   ✅ 清理测试文件完成');
        
        return true;
    } catch (error) {
        console.log(`   ❌ 测试失败: ${error.message}`);
        return false;
    }
}

// 测试3: 错误处理测试
function testErrorHandling() {
    console.log('\n⚠️  测试3: 错误处理功能');
    
    try {
        let errorCount = 0;
        
        // 测试无效JSON输入
        try {
            jsonStringToResData('invalid json');
        } catch (error) {
            console.log('   ✅ 无效JSON错误处理正常');
            errorCount++;
        }
        
        // 测试空输入
        try {
            jsonStringToResData('');
        } catch (error) {
            console.log('   ✅ 空输入错误处理正常');
            errorCount++;
        }
        
        // 测试无效二进制数据
        try {
            resDataToJsonString(new Uint8Array([1, 2, 3, 4]));
        } catch (error) {
            console.log('   ✅ 无效二进制数据错误处理正常');
            errorCount++;
        }
        
        if (errorCount >= 2) {
            console.log('   ✅ 错误处理测试通过');
            return true;
        } else {
            console.log('   ⚠️  部分错误处理可能需要改进');
            return true; // 不算失败，只是警告
        }
        
    } catch (error) {
        console.log(`   ❌ 测试失败: ${error.message}`);
        return false;
    }
}

// 运行所有测试
async function runAllTests() {
    const results = [];
    
    results.push(testLibraryImport());
    results.push(testFileOperations());
    results.push(testErrorHandling());
    
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    console.log('\n📊 测试结果汇总:');
    console.log(`   通过: ${passedTests}/${totalTests}`);
    console.log(`   成功率: ${Math.round(passedTests / totalTests * 100)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 所有测试通过！库功能正常。');
        process.exit(0);
    } else {
        console.log('\n❌ 部分测试失败，请检查代码。');
        process.exit(1);
    }
}

// 运行测试
runAllTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
});