/**
 * Godot Resource Parser - 文件转换示例
 * 
 * 本示例展示如何使用 godot-res-parser 库进行文件格式转换
 * 支持 .res <-> .json 双向转换
 */

import { resDataToJsonString, jsonStringToResData, setDebugMode } from '../godot_res.js';
import fs from 'fs';
import path from 'path';

// 启用调试模式
setDebugMode(false); // 关闭调试输出，保持示例输出清洁

console.log('🔄 Godot Resource Parser - 文件转换示例\n');

/**
 * 将 .res 文件转换为 .json 文件
 * @param {string} resFilePath - 输入的 .res 文件路径
 * @param {string} jsonFilePath - 输出的 .json 文件路径
 */
function convertRestoJson(resFilePath, jsonFilePath) {
    try {
        console.log(`📖 转换 ${resFilePath} -> ${jsonFilePath}`);
        
        // 检查输入文件是否存在
        if (!fs.existsSync(resFilePath)) {
            throw new Error(`输入文件不存在: ${resFilePath}`);
        }
        
        // 读取二进制文件
        const binaryData = fs.readFileSync(resFilePath);
        console.log(`   输入文件大小: ${binaryData.length} 字节`);
        
        // 解码为JSON
        const jsonString = resDataToJsonString(binaryData);
        
        // 格式化JSON并保存
        const formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);
        fs.writeFileSync(jsonFilePath, formattedJson);
        
        console.log(`   输出文件大小: ${formattedJson.length} 字符`);
        console.log('   ✅ 转换完成\n');
        
        return true;
    } catch (error) {
        console.error(`   ❌ 转换失败: ${error.message}\n`);
        return false;
    }
}

/**
 * 将 .json 文件转换为 .res 文件
 * @param {string} jsonFilePath - 输入的 .json 文件路径
 * @param {string} resFilePath - 输出的 .res 文件路径
 */
function convertJsonToRes(jsonFilePath, resFilePath) {
    try {
        console.log(`📝 转换 ${jsonFilePath} -> ${resFilePath}`);
        
        // 检查输入文件是否存在
        if (!fs.existsSync(jsonFilePath)) {
            throw new Error(`输入文件不存在: ${jsonFilePath}`);
        }
        
        // 读取JSON文件
        const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
        console.log(`   输入文件大小: ${jsonString.length} 字符`);
        
        // 验证JSON格式
        JSON.parse(jsonString); // 这会在JSON无效时抛出错误
        
        // 编码为二进制
        const binaryData = jsonStringToResData(jsonString);
        
        // 保存二进制文件
        fs.writeFileSync(resFilePath, binaryData);
        
        console.log(`   输出文件大小: ${binaryData.length} 字节`);
        console.log('   ✅ 转换完成\n');
        
        return true;
    } catch (error) {
        console.error(`   ❌ 转换失败: ${error.message}\n`);
        return false;
    }
}

/**
 * 批量转换目录中的文件
 * @param {string} inputDir - 输入目录
 * @param {string} outputDir - 输出目录
 * @param {string} fromExt - 源文件扩展名
 * @param {string} toExt - 目标文件扩展名
 */
function batchConvert(inputDir, outputDir, fromExt, toExt) {
    try {
        console.log(`🔄 批量转换: ${inputDir} (${fromExt} -> ${toExt})`);
        
        if (!fs.existsSync(inputDir)) {
            throw new Error(`输入目录不存在: ${inputDir}`);
        }
        
        // 创建输出目录
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 获取所有匹配的文件
        const files = fs.readdirSync(inputDir).filter(file => 
            path.extname(file).toLowerCase() === fromExt.toLowerCase()
        );
        
        if (files.length === 0) {
            console.log(`   ⚠️  未找到 ${fromExt} 文件\n`);
            return;
        }
        
        let successCount = 0;
        
        for (const file of files) {
            const inputPath = path.join(inputDir, file);
            const outputFile = path.basename(file, fromExt) + toExt;
            const outputPath = path.join(outputDir, outputFile);
            
            let success = false;
            if (fromExt === '.res' && toExt === '.json') {
                success = convertRestoJson(inputPath, outputPath);
            } else if (fromExt === '.json' && toExt === '.res') {
                success = convertJsonToRes(inputPath, outputPath);
            }
            
            if (success) successCount++;
        }
        
        console.log(`📊 批量转换完成: ${successCount}/${files.length} 个文件成功转换\n`);
        
    } catch (error) {
        console.error(`❌ 批量转换失败: ${error.message}\n`);
    }
}

// 示例使用
console.log('🎯 文件转换示例:\n');

// 检查是否有现有的 .res 文件可以转换
const currentDir = process.cwd();
const resFiles = fs.readdirSync(currentDir).filter(file => 
    path.extname(file).toLowerCase() === '.res'
);

if (resFiles.length > 0) {
    console.log(`发现 ${resFiles.length} 个 .res 文件，开始转换示例:\n`);
    
    // 转换第一个找到的 .res 文件
    const firstResFile = resFiles[0];
    const jsonOutput = path.basename(firstResFile, '.res') + '_converted.json';
    const resOutput = path.basename(firstResFile, '.res') + '_reconverted.res';
    
    // .res -> .json
    if (convertRestoJson(firstResFile, jsonOutput)) {
        // .json -> .res (往返测试)
        if (convertJsonToRes(jsonOutput, resOutput)) {
            // 比较原始文件和往返转换后的文件
            try {
                const originalData = fs.readFileSync(firstResFile);
                const reconvertedData = fs.readFileSync(resOutput);
                
                if (originalData.length === reconvertedData.length) {
                    console.log('🎉 往返转换测试: 文件大小一致');
                } else {
                    console.log(`⚠️  往返转换测试: 文件大小不同 (${originalData.length} vs ${reconvertedData.length})`);
                }
                
                // 清理测试文件
                fs.unlinkSync(jsonOutput);
                fs.unlinkSync(resOutput);
                console.log('🧹 清理测试文件完成');
                
            } catch (error) {
                console.error('❌ 往返测试失败:', error.message);
            }
        }
    }
} else {
    console.log('⚠️  当前目录中未找到 .res 文件');
    console.log('💡 提示: 将一些 .res 文件放在当前目录中，然后重新运行此示例');
}

console.log('\n🎉 文件转换示例完成！');
console.log('\n📚 使用方法:');
console.log('   node examples/file-conversion.js');
console.log('\n🔧 可用函数:');
console.log('   - convertRestoJson(resFile, jsonFile)');
console.log('   - convertJsonToRes(jsonFile, resFile)');
console.log('   - batchConvert(inputDir, outputDir, fromExt, toExt)');