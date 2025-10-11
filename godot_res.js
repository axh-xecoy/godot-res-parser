import { CompleteResourceEncoder } from './godot_res_encode.js';
import { CompleteResourceParser } from './godot_res_decode.js';

// 全局调试标志
let debugMode = false;
let debugLogger = null;

/**
 * 设置调试模式
 * @param {boolean} enabled - 是否启用调试模式
 * @param {function} logger - 日志记录函数，默认使用console.log
 */
export function setDebugMode(enabled, logger = console.log) {
    debugMode = enabled;
    debugLogger = logger;
}

/**
 * 内部调试日志函数
 * @param {string} message - 日志消息
 */
function debugLog(message) {
    if (debugMode && debugLogger) {
        debugLogger(`[DEBUG] ${message}`);
    }
}

/**
 * 将二进制res数据转换为JSON字符串
 * @param {Uint8Array} resData - 二进制res数据
 * @returns {string} JSON字符串
 */
function resDataToJsonString(resData) {
    debugLog(`开始解码，输入数据大小: ${resData.length} 字节`);
    debugLog(`输入数据前16字节: ${Array.from(resData.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    
    const startTime = Date.now();
    const parser = new CompleteResourceParser();
    parser.setBuffer(Buffer.from(resData));
    
    debugLog('开始解析资源...');
    const result = parser.parseComplete();
    const parseTime = Date.now() - startTime;
    
    debugLog(`解析完成，耗时: ${parseTime}ms`);
    debugLog(`解析结果类型: ${typeof result}`);
    
    if (result && typeof result === 'object') {
        debugLog(`解析结果包含字段: ${Object.keys(result).join(', ')}`);
        if (result.header) {
            debugLog(`头部信息: 版本=${result.header.version}, 类型=${result.header.resourceType}`);
        }
        if (result.resourceData && result.resourceData.properties) {
            const propCount = Object.keys(result.resourceData.properties).length;
            debugLog(`资源数据包含 ${propCount} 个属性`);
        }
    }
    
    const jsonStartTime = Date.now();
    const jsonString = JSON.stringify(result, null, 2);
    const jsonTime = Date.now() - jsonStartTime;
    
    debugLog(`JSON序列化完成，耗时: ${jsonTime}ms，输出长度: ${jsonString.length} 字符`);
    
    return jsonString;
}

/**
 * 将JSON字符串转换为二进制res数据
 * @param {string} jsonString - JSON字符串
 * @returns {Uint8Array} 二进制res数据
 */
function jsonStringToResData(jsonString) {
    debugLog(`开始编码，输入JSON长度: ${jsonString.length} 字符`);
    
    const parseStartTime = Date.now();
    const data = JSON.parse(jsonString);
    const parseTime = Date.now() - parseStartTime;
    
    debugLog(`JSON解析完成，耗时: ${parseTime}ms`);
    debugLog(`解析数据类型: ${typeof data}`);
    
    if (data && typeof data === 'object') {
        debugLog(`数据包含字段: ${Object.keys(data).join(', ')}`);
        if (data.header) {
            debugLog(`头部信息: 版本=${data.header.version}, 类型=${data.header.resourceType}`);
        }
        if (data.resourceData && data.resourceData.properties) {
            const propCount = Object.keys(data.resourceData.properties).length;
            debugLog(`资源数据包含 ${propCount} 个属性`);
        }
    }
    
    const encodeStartTime = Date.now();
    const encoder = new CompleteResourceEncoder();
    
    debugLog('开始编码资源...');
    const buffer = encoder.encode(data);
    const encodeTime = Date.now() - encodeStartTime;
    
    debugLog(`编码完成，耗时: ${encodeTime}ms，输出大小: ${buffer.length} 字节`);
    
    const result = new Uint8Array(buffer);
    debugLog(`输出数据前16字节: ${Array.from(result.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    
    return result;
}

// 导出类以供高级用户使用
export { 
    CompleteResourceEncoder, 
    CompleteResourceParser,
    resDataToJsonString,
    jsonStringToResData
 };