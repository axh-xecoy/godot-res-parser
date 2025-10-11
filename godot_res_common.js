import fs from 'fs';

// Godot Binary Resource Format Variant类型定义 (与Godot源码一致)
export const VariantType = {
    NIL: 1,
    BOOL: 2,
    INT: 3,
    FLOAT: 4,
    STRING: 5,
    VECTOR2: 10,
    RECT2: 11,
    VECTOR3: 12,
    PLANE: 13,
    QUATERNION: 14,
    AABB: 15,
    BASIS: 16,
    TRANSFORM3D: 17,
    TRANSFORM2D: 18,
    COLOR: 20,
    NODE_PATH: 22,
    RID: 23,
    OBJECT: 24,
    INPUT_EVENT: 25,
    DICTIONARY: 26,
    ARRAY: 30,
    PACKED_BYTE_ARRAY: 31,
    PACKED_INT32_ARRAY: 32,
    PACKED_FLOAT32_ARRAY: 33,
    PACKED_STRING_ARRAY: 34,
    PACKED_VECTOR3_ARRAY: 35,
    PACKED_COLOR_ARRAY: 36,
    PACKED_VECTOR2_ARRAY: 37,
    INT64: 40,
    DOUBLE: 41,
    CALLABLE: 42,
    SIGNAL: 43,
    STRING_NAME: 44,
    VECTOR2I: 45,
    RECT2I: 46,
    VECTOR3I: 47,
    PACKED_INT64_ARRAY: 48,
    PACKED_FLOAT64_ARRAY: 49,
    VECTOR4: 50,
    VECTOR4I: 51,
    PROJECTION: 52,
    PACKED_VECTOR4_ARRAY: 53
};

// 获取Variant类型名称的映射
export function getVariantTypeName(type) {
    const typeNames = {
        [VariantType.NIL]: 'NIL',
        [VariantType.BOOL]: 'BOOL',
        [VariantType.INT]: 'INT',
        [VariantType.FLOAT]: 'FLOAT',
        [VariantType.STRING]: 'STRING',
        [VariantType.VECTOR2]: 'VECTOR2',
        [VariantType.RECT2]: 'RECT2',
        [VariantType.VECTOR3]: 'VECTOR3',
        [VariantType.PLANE]: 'PLANE',
        [VariantType.QUATERNION]: 'QUATERNION',
        [VariantType.AABB]: 'AABB',
        [VariantType.BASIS]: 'BASIS',
        [VariantType.TRANSFORM3D]: 'TRANSFORM3D',
        [VariantType.TRANSFORM2D]: 'TRANSFORM2D',
        [VariantType.COLOR]: 'COLOR',
        [VariantType.NODE_PATH]: 'NODE_PATH',
        [VariantType.RID]: 'RID',
        [VariantType.OBJECT]: 'OBJECT',
        [VariantType.INPUT_EVENT]: 'INPUT_EVENT',
        [VariantType.DICTIONARY]: 'DICTIONARY',
        [VariantType.ARRAY]: 'ARRAY',
        [VariantType.PACKED_BYTE_ARRAY]: 'PACKED_BYTE_ARRAY',
        [VariantType.PACKED_INT32_ARRAY]: 'PACKED_INT32_ARRAY',
        [VariantType.PACKED_FLOAT32_ARRAY]: 'PACKED_FLOAT32_ARRAY',
        [VariantType.PACKED_STRING_ARRAY]: 'PACKED_STRING_ARRAY',
        [VariantType.PACKED_VECTOR3_ARRAY]: 'PACKED_VECTOR3_ARRAY',
        [VariantType.PACKED_COLOR_ARRAY]: 'PACKED_COLOR_ARRAY',
        [VariantType.PACKED_VECTOR2_ARRAY]: 'PACKED_VECTOR2_ARRAY',
        [VariantType.INT64]: 'INT64',
        [VariantType.DOUBLE]: 'DOUBLE',
        [VariantType.CALLABLE]: 'CALLABLE',
        [VariantType.SIGNAL]: 'SIGNAL',
        [VariantType.STRING_NAME]: 'STRING_NAME',
        [VariantType.VECTOR2I]: 'VECTOR2I',
        [VariantType.RECT2I]: 'RECT2I',
        [VariantType.VECTOR3I]: 'VECTOR3I',
        [VariantType.PACKED_INT64_ARRAY]: 'PACKED_INT64_ARRAY',
        [VariantType.PACKED_FLOAT64_ARRAY]: 'PACKED_FLOAT64_ARRAY',
        [VariantType.VECTOR4]: 'VECTOR4',
        [VariantType.VECTOR4I]: 'VECTOR4I',
        [VariantType.PROJECTION]: 'PROJECTION',
        [VariantType.PACKED_VECTOR4_ARRAY]: 'PACKED_VECTOR4_ARRAY'
    };
    return typeNames[type] || `UNKNOWN_TYPE_${type}`;
}

// 基础二进制读取器类
export class BinaryReader {
    constructor(buffer = null) {
        this.buffer = buffer;
        this.position = 0;
    }

    setBuffer(buffer) {
        this.buffer = buffer;
        this.position = 0;
    }

    readUint32() {
        const value = this.buffer.readUInt32LE(this.position);
        this.position += 4;
        return value;
    }

    readInt32() {
        const rawValue = this.buffer.readUInt32LE(this.position);
        // 将无符号32位整数转换为有符号32位整数
        const value = rawValue > 0x7FFFFFFF ? rawValue - 0x100000000 : rawValue;
        this.position += 4;
        return value;
    }

    readUint64() {
        const value = this.buffer.readBigUInt64LE(this.position);
        this.position += 8;
        return value;
    }

    readInt64() {
        const rawValue = this.buffer.readBigUInt64LE(this.position);
        // 将无符号64位整数转换为有符号64位整数
        const value = rawValue > 0x7FFFFFFFFFFFFFFFn ? rawValue - 0x10000000000000000n : rawValue;
        this.position += 8;
        return value;
    }

    readFloat() {
        const value = this.buffer.readFloatLE(this.position);
        this.position += 4;
        return value;
    }

    readDouble() {
        const value = this.buffer.readDoubleLE(this.position);
        this.position += 8;
        return value;
    }

    readUnicodeString() {
        const length = this.readUint32();
        if (length > 1048576) { // 1MB limit
            throw new Error(`字符串长度过长: ${length}`);
        }
        
        const stringBytes = this.buffer.subarray(this.position, this.position + length);
        this.position += length;
        
        // 移除末尾的null字符
        let content = stringBytes.toString('utf8');
        if (content.endsWith('\0')) {
            content = content.slice(0, -1);
        }
        
        return content;
    }

    skipBytes(count) {
        this.position += count;
    }

    getCurrentPosition() {
        return this.position;
    }

    setPosition(pos) {
        this.position = pos;
    }

    getRemainingBytes() {
        return this.buffer.length - this.position;
    }
}

// 基础二进制写入器类
export class BinaryWriter {
    constructor() {
        this.buffers = [];
        this.totalLength = 0;
    }

    writeUint16(value) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16LE(value, 0);
        this.buffers.push(buffer);
    }

    writeUint32(value) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32LE(value, 0);
        this.buffers.push(buffer);
        this.totalLength += 4;
    }

    writeInt32(value) {
        // 确保值在32位有符号整数范围内
        const clampedValue = Math.max(-0x80000000, Math.min(0x7FFFFFFF, value));
        // 转换为无符号32位表示
        const unsignedValue = clampedValue < 0 ? clampedValue + 0x100000000 : clampedValue;
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32LE(unsignedValue, 0);
        this.buffers.push(buffer);
        this.totalLength += 4;
    }

    writeUint64(value) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64LE(BigInt(value), 0);
        this.buffers.push(buffer);
        this.totalLength += 8;
    }

    writeInt64(value) {
        // 确保值在64位有符号整数范围内
        const clampedValue = value > 0x7FFFFFFFFFFFFFFFn ? 0x7FFFFFFFFFFFFFFFn : 
                           value < -0x8000000000000000n ? -0x8000000000000000n : value;
        // 转换为无符号64位表示
        const unsignedValue = clampedValue < 0n ? clampedValue + 0x10000000000000000n : clampedValue;
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeBigUInt64LE(BigInt(unsignedValue), 0);
        this.buffers.push(buffer);
        this.totalLength += 8;
    }

    writeFloat(value) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatLE(value, 0);
        this.buffers.push(buffer);
        this.totalLength += 4;
    }

    writeDouble(value) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleLE(value, 0);
        this.buffers.push(buffer);
        this.totalLength += 8;
    }

    writeUnicodeString(str, bitOnLen = false) {
        const utf8Buffer = Buffer.from(str + '\0', 'utf8');
        let length = utf8Buffer.length;
        
        // 如果bitOnLen为true，设置长度的最高位（与Godot的p_bit_on_len参数对应）
        if (bitOnLen) {
            length = length | 0x80000000;
        }
        
        this.writeUint32(length);
        this.buffers.push(utf8Buffer);
        this.totalLength += utf8Buffer.length;
    }

    writeBytes(buffer) {
        this.buffers.push(buffer);
        this.totalLength += buffer.length;
    }

    toBuffer() {
        return Buffer.concat(this.buffers, this.totalLength);
    }

    getLength() {
        return this.totalLength;
    }
}

// 通用工具函数
export function loadFile(filePath) {
    return fs.readFileSync(filePath);
}

export function saveFile(filePath, buffer) {
    fs.writeFileSync(filePath, buffer);
}

export function saveJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function loadJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}