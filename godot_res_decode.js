import { 
    VariantType, 
    getVariantTypeName, 
    BinaryReader
} from './godot_res_common.js';

export class CompleteResourceParser extends BinaryReader {
    constructor() {
        super();
        this.stringTable = [];
        this.externalResources = [];
        this.internalResources = [];
    }

    loadFile(filePath) {
        const buffer = require('fs').readFileSync(filePath);
        this.setBuffer(buffer);
    }

    parseHeader() {
        
        // 魔数
        const magic = this.buffer.subarray(0, 4).toString('ascii');
        this.position = 4;

        // 大端序和Real64标志
        const bigEndian = this.readUint32() !== 0;
        const useReal64 = this.readUint32() !== 0;

        // 版本信息
        const verMajor = this.readUint32();
        const verMinor = this.readUint32();
        const verFormat = this.readUint32();

        // 资源类型
        const resourceType = this.readUnicodeString();

        // 导入元数据偏移
        const importMetadataOffset = this.readUint64();

        // 标志
        const flags = this.readUint32();
        const hasNamedSceneIds = (flags & 0x01) !== 0;
        const hasUids = (flags & 0x02) !== 0;
        const hasScriptClass = (flags & 0x08) !== 0;
        const realTIsDouble = (flags & 0x04) !== 0;

        // UID
        const uid = this.readUint64();

        // 脚本类（如果有）
        let scriptClass = '';
        if (hasScriptClass) {
            scriptClass = this.readUnicodeString();
        }

        // 跳过保留字段 (11个字段，每个4字节)
        for (let i = 0; i < 11; i++) {
            this.readUint32();
        }

        
        return {
            magic, 
            bigEndian, 
            useReal64, 
            verMajor,
            verMinor,
            verFormat,
            resourceType, 
            importMetadataOffset: importMetadataOffset.toString(),
            flags,
            uid: uid.toString(),
            scriptClass,
            hasNamedSceneIds, 
            hasUids, 
            hasScriptClass, 
            realTIsDouble
        };
    }

    parseStringTable() {
        
        const stringCount = this.readUint32();
        if (stringCount > 100000) {
            throw new Error(`字符串数量过多: ${stringCount}`);
        }

        this.stringTable = [];
        for (let i = 0; i < stringCount; i++) {
            const str = this.readUnicodeString();
            this.stringTable.push(str);
        }

        return this.stringTable;
    }

    parseExternalResources() {
        
        const extResourceCount = this.readUint32();
        this.externalResources = [];
        
        for (let i = 0; i < extResourceCount; i++) {
            const type = this.readUnicodeString();
            const path = this.readUnicodeString();
            const uid = this.readUint64();
            
            this.externalResources.push({ 
                type, 
                path, 
                uid: uid.toString()
            });
        }

        return this.externalResources;
    }

    parseInternalResources() {
        
        const intResourceCount = this.readUint32();
        this.internalResources = [];
        
        for (let i = 0; i < intResourceCount; i++) {
            const path = this.readUnicodeString();
            const offset = this.readUint64();
            
            this.internalResources.push({ 
                path, 
                offset: offset.toString()
            });
        }

        return this.internalResources;
    }

    getString(index) {
        if (index < 0 || index >= this.stringTable.length) {
            throw new Error(`字符串索引超出范围: ${index}`);
        }
        return this.stringTable[index];
    }

    parseVariant() {
        const type = this.readUint32();
        
        switch (type) {
            case VariantType.NIL:
                return null;
                
            case VariantType.BOOL:
                const boolValue = this.readUint32() !== 0;
                return boolValue;
                
            case VariantType.INT:
                const intValue = this.readInt32();
                return {
                    $type: "INT",
                    $value: intValue
                };
                
            case VariantType.FLOAT:
                const floatValue = this.readFloat();
                return {
                    $type: "FLOAT",
                    $value: floatValue
                };
                
            case VariantType.STRING:
                const str = this.readUnicodeString();
                return str;
                
            case VariantType.STRING_NAME:
                const stringNameValue = this.readUnicodeString();
                return stringNameValue;
                
            case VariantType.DICTIONARY:
                return this.parseDictionary();
                
            case VariantType.ARRAY:
                return this.parseArray();
                
            case VariantType.OBJECT:
                return this.parseObject();
                
            case VariantType.INT64:
                const int64Value = this.readInt64();
                return {
                    $type: "INT64",
                    $value: int64Value.toString()
                };
                
            case VariantType.DOUBLE:
                const doubleValue = this.readDouble();
                return {
                    $type: "DOUBLE",
                    $value: doubleValue
                };
                
            default:
                return null;
        }
    }

    parseDictionary() {
        const length = this.readUint32();
        const isShared = (length & 0x80000000) !== 0;
        const actualLength = length & 0x7FFFFFFF;
        
        const dict = {};
        for (let i = 0; i < actualLength; i++) {
            const key = this.parseVariant();
            const value = this.parseVariant();
            dict[key] = value;
        }
        
        return dict;
    }

    parseArray() {
        const length = this.readUint32();
        const isShared = (length & 0x80000000) !== 0;
        const actualLength = length & 0x7FFFFFFF;
        
        const array = [];
        for (let i = 0; i < actualLength; i++) {
            const value = this.parseVariant();
            array.push(value);
        }
        
        return array;
    }

    parseObject() {
        const objectType = this.readUint32();
        
        if (objectType === 0) {
            // 空对象
            return null;
        } else if (objectType === 1) {
            // 外部资源引用
            const resourceIndex = this.readUint32();
            return { type: 'external_resource', index: resourceIndex };
        } else if (objectType === 2) {
            // 内部资源引用
            const resourceIndex = this.readUint32();
            return { type: 'internal_resource', index: resourceIndex };
        } else if (objectType === 3) {
            // 资源对象
            const resourcePath = this.readUnicodeString();
            return { type: 'resource', path: resourcePath };
        }
        
        return null;
    }

    parseResourceData(offset) {
        
        // 跳转到资源数据位置
        this.position = offset;
        
        // 读取资源类型
        const resourceType = this.readUnicodeString();
        
        // 读取属性数量
        const propertyCount = this.readUint32();
        
        const properties = {};
        
        for (let i = 0; i < propertyCount; i++) {
            
            try {
                // 读取属性名（字符串表索引）
                const nameIndex = this.readUint32();
                if (nameIndex >= this.stringTable.length) {
                    break;
                }
                
                const propertyName = this.getString(nameIndex);
                
                // 读取属性值
                const propertyValue = this.parseVariant();
                
                properties[propertyName] = propertyValue;
                
            } catch (error) {
                break;
            }
        }
        
        return {
            type: resourceType,
            properties: properties
        };
    }

    parseComplete() {
        try {
            // 解析文件头
            const header = this.parseHeader();
            
            // 解析字符串表
            const stringTable = this.parseStringTable();
            
            // 解析外部资源
            const externalResources = this.parseExternalResources();
            
            // 解析内部资源
            const internalResources = this.parseInternalResources();
            
            // 解析实际的资源数据
            let resourceData = null;
            if (internalResources.length > 0) {
                const mainResource = internalResources[internalResources.length - 1];
                // 提取offset的实际数值
                const offset = parseInt(mainResource.offset);
                resourceData = this.parseResourceData(offset);
            }
            
            return {
                header,
                stringTable,
                externalResources,
                internalResources,
                resourceData
            };
            
        } catch (error) {
            console.error(`解析失败: ${error.message}`);
            return null;
        }
    }
}