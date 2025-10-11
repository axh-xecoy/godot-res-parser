import { 
    VariantType, 
    BinaryWriter
} from './godot_res_common.js';

export class CompleteResourceEncoder extends BinaryWriter {
    constructor() {
        super();
        this.stringTable = [];
        this.stringIndexMap = new Map();
        this.debugOffset = 0; // 添加调试偏移追踪
    }

    // 重写父类方法以添加调试信息
    writeBytes(buffer) {
        super.writeBytes(buffer);
        this.debugOffset += buffer.length;
    }

    writeUint32(value) {
        super.writeUint32(value);
        this.debugOffset += 4;
    }

    writeUint16(value) {
        super.writeUint16(value);
        this.debugOffset += 2;
    }

    writeUint8(value) {
        super.writeUint8(value);
        this.debugOffset += 1;
    }

    writeFloat32(value) {
        super.writeFloat32(value);
        this.debugOffset += 4;
    }

    writeFloat64(value) {
        super.writeFloat64(value);
        this.debugOffset += 8;
    }

    writeUnicodeString(str, bitOnLen = false) {
        const startOffset = this.debugOffset;
        super.writeUnicodeString(str, bitOnLen);
    }

    buildStringTable(data) {
        this.stringTable = data.stringTable || [];
        this.stringIndexMap.clear();
        for (let i = 0; i < this.stringTable.length; i++) {
            this.stringIndexMap.set(this.stringTable[i], i);
        }
    }

    getStringIndex(str) {
        const index = this.stringIndexMap.get(str);
        if (index === undefined) {
            throw new Error(`字符串未在字符串表中找到: "${str}"`);
        }
        return index;
    }

    writeHeader(header) {
        // 魔数
        const magicBuffer = Buffer.from(header.magic, 'ascii');
        this.writeBytes(magicBuffer);

        // 大端序和Real64标志
        this.writeUint32(header.bigEndian ? 1 : 0);
        this.writeUint32(header.useReal64 ? 1 : 0);

        // 版本信息
        this.writeUint32(header.verMajor);
        this.writeUint32(header.verMinor);
        this.writeUint32(header.verFormat);

        // 资源类型
        this.writeUnicodeString(header.resourceType);

        // 导入元数据偏移
        this.writeUint64(BigInt(header.importMetadataOffset));

        // 标志
        this.writeUint32(header.flags);

        // UID
        this.writeUint64(BigInt(header.uid));

        // 脚本类（如果有）
        // 注意：根据flags中的hasScriptClass位来判断，而不是header.hasScriptClass属性
        const hasScriptClass = (header.flags & 0x08) !== 0;
        if (hasScriptClass && header.scriptClass) {
            this.writeUnicodeString(header.scriptClass);
        }

        // 保留字段 (11个字段，每个4字节)
        for (let i = 0; i < 11; i++) {
            this.writeUint32(0);
        }
    }

    writeStringTable() {
        this.writeUint32(this.stringTable.length);
        
        for (let i = 0; i < this.stringTable.length; i++) {
            this.writeUnicodeString(this.stringTable[i]);
        }
    }

    writeExternalResources(externalResources) {
        this.writeUint32(externalResources.length);
        
        for (let i = 0; i < externalResources.length; i++) {
            const resource = externalResources[i];
            
            this.writeUnicodeString(resource.type);
            this.writeUnicodeString(resource.path);
            
            // 处理uid，可能是字符串或数字
            let uid = resource.uid;
            if (typeof uid === 'string') {
                uid = BigInt(uid);
            } else if (typeof uid === 'number') {
                uid = BigInt(uid);
            }
            this.writeUint64(uid);
        }
    }

    writeInternalResources(internalResources) {
        this.writeUint32(internalResources.length);
        
        for (let i = 0; i < internalResources.length; i++) {
            const resource = internalResources[i];
            
            this.writeUnicodeString(resource.path);
            
            // 处理offset，可能是字符串或数字
            let offset = resource.offset;
            if (typeof offset === 'string') {
                offset = BigInt(offset);
            } else if (typeof offset === 'number') {
                offset = BigInt(offset);
            }
            this.writeUint64(offset);
        }
    }

    writeVariant(value) {
        const startOffset = this.debugOffset;
        
        if (value === null || value === undefined) {
            this.writeUint32(VariantType.NIL);
            return;
        }

        // 处理类型标注格式 { $type: "类型", $value: 值 }
        if (typeof value === 'object' && value.$type && value.$value !== undefined) {
            const type = value.$type;
            const actualValue = value.$value;
            
            switch (type) {
                case 'INT':
                    this.writeUint32(VariantType.INT);
                    this.writeInt32(actualValue);
                    return;
                    
                case 'FLOAT':
                    this.writeUint32(VariantType.FLOAT);
                    this.writeFloat(actualValue);
                    return;
                    
                case 'INT64':
                    this.writeUint32(VariantType.INT64);
                    this.writeInt64(BigInt(actualValue));
                    return;
                    
                case 'DOUBLE':
                    this.writeUint32(VariantType.DOUBLE);
                    this.writeDouble(actualValue);
                    return;
                    
                default:
                    throw new Error(`不支持的类型标注: ${type}`);
            }
        }

        if (typeof value === 'boolean') {
            this.writeUint32(VariantType.BOOL);
            this.writeUint32(value ? 1 : 0);
            return;
        }

        if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                this.writeUint32(VariantType.INT);
                this.writeInt32(value);
            } else {
                this.writeUint32(VariantType.FLOAT);
                this.writeFloat(value);
            }
            return;
        }

        if (typeof value === 'string') {
            this.writeUint32(VariantType.STRING);
            this.writeUnicodeString(value);
            return;
        }

        if (typeof value === 'bigint') {
            this.writeUint32(VariantType.INT64);
            this.writeInt64(value);
            return;
        }

        if (Array.isArray(value)) {
            this.writeUint32(VariantType.ARRAY);
            this.writeUint32(value.length);
            
            for (let i = 0; i < value.length; i++) {
                this.writeVariant(value[i]);
            }
            return;
        }

        if (typeof value === 'object') {
            // 检查是否是特殊对象类型
            if (value.type === 'external_resource' || value.type === 'internal_resource' || value.type === 'resource') {
                this.writeUint32(VariantType.OBJECT);
                
                if (value.type === 'external_resource') {
                    this.writeUint32(1);
                    this.writeUint32(value.index);
                } else if (value.type === 'internal_resource') {
                    this.writeUint32(2);
                    this.writeUint32(value.index);
                } else if (value.type === 'resource') {
                    this.writeUint32(3);
                    this.writeUint32(value.path ? value.path.length : 0);
                    if (value.path && value.path.length > 0) {
                        this.writeBytes(Buffer.from(value.path, 'utf8'));
                    }
                }
                return;
            }

            // 检查是否是NodePath类型
            if (value.type === 'node_path' || value.type === 'NodePath') {
                this.writeUint32(VariantType.NODE_PATH);
                
                const names = value.names || [];
                const subnames = value.subnames || [];
                const isAbsolute = value.absolute || false;
                
                // 写入name count
                this.writeUint16(names.length);
                
                // 写入subname count，如果是绝对路径则设置最高位
                let subnameCount = subnames.length;
                if (isAbsolute) {
                    subnameCount |= 0x8000;
                }
                this.writeUint16(subnameCount);
                
                // 写入names，使用bitOnLen=true
                for (let i = 0; i < names.length; i++) {
                    const name = names[i];
                    
                    // 检查是否在字符串表中
                    if (this.stringIndexMap.has(name)) {
                        const stringIndex = this.stringIndexMap.get(name);
                        this.writeUint32(stringIndex);
                    } else {
                        this.writeUnicodeString(name, true);
                    }
                }
                
                // 写入subnames，使用bitOnLen=true
                for (let i = 0; i < subnames.length; i++) {
                    const subname = subnames[i];
                    
                    // 检查是否在字符串表中
                    if (this.stringIndexMap.has(subname)) {
                        const stringIndex = this.stringIndexMap.get(subname);
                        this.writeUint32(stringIndex);
                    } else {
                        this.writeUnicodeString(subname, true);
                    }
                }
                
                return;
            }

            // 普通字典
            const keys = Object.keys(value);
            this.writeUint32(VariantType.DICTIONARY);
            this.writeUint32(keys.length);
            
            for (const key of keys) {
                this.writeVariant(key);
                this.writeVariant(value[key]);
            }
            
            return;
        }

        throw new Error(`不支持的数据类型: ${typeof value}`);

    }

    writeResourceData(resourceData, offset) {
        
        // 写入资源类型
        this.writeUnicodeString(resourceData.type);
        
        // 写入属性数量
        const properties = resourceData.properties;
        const propertyNames = Object.keys(properties);
        this.writeUint32(propertyNames.length);
        
        for (const propertyName of propertyNames) {
            
            // 写入属性名（字符串表索引）
            const nameIndex = this.getStringIndex(propertyName);
            this.writeUint32(nameIndex);
            
            // 写入属性值
            this.writeVariant(properties[propertyName]);
        }
        
    }

    encode(data) {
        try {
            
            // 构建字符串表
            this.buildStringTable(data);
            
            // 写入文件头
            this.writeHeader(data.header);
            
            // 写入字符串表
            this.writeStringTable();
            
            // 写入外部资源
            this.writeExternalResources(data.externalResources || []);
            
            // 写入内部资源
            this.writeInternalResources(data.internalResources || []);
            
            // 写入资源数据
            if (data.resourceData) {
                // 注意：这里我们假设资源数据紧跟在内部资源表之后
                // 在实际实现中，可能需要根据内部资源表中的偏移量来确定位置
                this.writeResourceData(data.resourceData, this.getLength());
            }
            
            // 写入文件末尾的RSRC魔数（根据Godot源码要求）
            const rsrcMagic = Buffer.from('RSRC', 'ascii');
            this.writeBytes(rsrcMagic);
            
            return this.toBuffer();
            
        } catch (error) {
            console.error(`编码失败: ${error.message}`);
            throw error;
        }
    }
}