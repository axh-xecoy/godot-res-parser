/**
 * Godot Resource Parser - TypeScript 类型定义
 * 
 * 为 godot-res-parser 库提供完整的 TypeScript 类型支持
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * Godot 资源文件头部信息
 */
export interface GodotResourceHeader {
  /** 魔数，通常为 "RSRC" */
  magic: string;
  /** 是否为大端字节序 */
  bigEndian: boolean;
  /** 是否使用 64 位实数 */
  useReal64: boolean;
  /** 主版本号 */
  verMajor: number;
  /** 次版本号 */
  verMinor: number;
  /** 格式版本号 */
  verFormat: number;
  /** 资源类型 */
  resourceType: string;
  /** 导入元数据偏移量 */
  importMetadataOffset: string;
  /** 标志位 */
  flags: number;
  /** 唯一标识符 */
  uid: string;
  /** 脚本类名 */
  scriptClass: string;
  /** 是否有命名场景ID */
  hasNamedSceneIds: boolean;
  /** 是否有UID */
  hasUids: boolean;
  /** 是否有脚本类 */
  hasScriptClass: boolean;
  /** 实数类型是否为双精度 */
  realTIsDouble: boolean;
}

/**
 * 外部资源引用
 */
export interface ExternalResource {
  /** 资源类型 */
  type: string;
  /** 资源路径 */
  path: string;
  /** 资源ID */
  id?: string;
}

/**
 * 内部资源定义
 */
export interface InternalResource {
  /** 资源类型 */
  type: string;
  /** 资源路径（可选） */
  path?: string;
  /** 资源ID */
  id?: string;
}

/**
 * 资源数据
 */
export interface ResourceData {
  /** 资源类型 */
  type: string;
  /** 资源属性 */
  properties: Record<string, any>;
}

/**
 * 完整的 Godot 资源结构
 */
export interface GodotResource {
  /** 文件头部信息 */
  header: GodotResourceHeader;
  /** 字符串表 */
  stringTable: string[];
  /** 外部资源列表 */
  externalResources: ExternalResource[];
  /** 内部资源列表 */
  internalResources: InternalResource[];
  /** 主要资源数据 */
  resourceData: ResourceData;
}

// ============================================================================
// 日志记录器类型
// ============================================================================

/**
 * 日志记录器函数类型
 */
export type Logger = (message: string) => void;

// ============================================================================
// 主要 API 函数
// ============================================================================

/**
 * 设置调试模式
 * @param enabled 是否启用调试模式
 * @param logger 自定义日志记录器，默认使用 console.log
 */
export function setDebugMode(enabled: boolean, logger?: Logger): void;

/**
 * 将二进制 .res 数据转换为 JSON 字符串
 * @param resData 二进制资源数据
 * @returns JSON 字符串
 * @throws 当解析失败时抛出错误
 */
export function resDataToJsonString(resData: Uint8Array): string;

/**
 * 将 JSON 字符串转换为二进制 .res 数据
 * @param jsonString JSON 字符串，必须符合 Godot 资源格式
 * @returns 二进制资源数据
 * @throws 当编码失败时抛出错误
 */
export function jsonStringToResData(jsonString: string): Uint8Array;

// ============================================================================
// 高级 API 类
// ============================================================================

/**
 * 完整的资源编码器
 */
export class CompleteResourceEncoder {
  /**
   * 创建编码器实例
   */
  constructor();

  /**
   * 编码资源数据
   * @param resource 资源对象
   * @returns 编码后的二进制数据
   */
  encode(resource: GodotResource): Uint8Array;
}

/**
 * 完整的资源解析器
 */
export class CompleteResourceParser {
  /**
   * 创建解析器实例
   */
  constructor();

  /**
   * 解析二进制资源数据
   * @param data 二进制数据
   * @returns 解析后的资源对象
   */
  parse(data: Uint8Array): GodotResource;
}

// ============================================================================
// 错误类型
// ============================================================================

/**
 * 资源解析错误
 */
export class ResourceParseError extends Error {
  constructor(message: string);
}

/**
 * 资源编码错误
 */
export class ResourceEncodeError extends Error {
  constructor(message: string);
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 支持的 Godot 版本
 */
export type GodotVersion = '4.0' | '4.1' | '4.2' | '4.3' | '4.4' | '4.5';

/**
 * 资源类型枚举
 */
export type ResourceType = 
  | 'Resource'
  | 'PackedScene'
  | 'Script'
  | 'Texture2D'
  | 'AudioStream'
  | 'Mesh'
  | 'Material'
  | 'Shader'
  | string; // 允许自定义类型

/**
 * 编码选项
 */
export interface EncodeOptions {
  /** 是否使用大端字节序 */
  bigEndian?: boolean;
  /** 是否使用 64 位实数 */
  useReal64?: boolean;
  /** 目标 Godot 版本 */
  targetVersion?: GodotVersion;
}

/**
 * 解码选项
 */
export interface DecodeOptions {
  /** 是否验证数据完整性 */
  validateData?: boolean;
  /** 是否保留原始字节序 */
  preserveEndianness?: boolean;
}

// ============================================================================
// 模块导出
// ============================================================================

/**
 * 默认导出：主要 API 函数
 */
declare const godotResParser: {
  setDebugMode: typeof setDebugMode;
  resDataToJsonString: typeof resDataToJsonString;
  jsonStringToResData: typeof jsonStringToResData;
  CompleteResourceEncoder: typeof CompleteResourceEncoder;
  CompleteResourceParser: typeof CompleteResourceParser;
};

export default godotResParser;

// ============================================================================
// 命名空间导出（可选）
// ============================================================================

/**
 * 类型命名空间
 */
export namespace Types {
  export type Resource = GodotResource;
  export type Header = GodotResourceHeader;
  export type External = ExternalResource;
  export type Internal = InternalResource;
  export type Data = ResourceData;
}

/**
 * 工具命名空间
 */
export namespace Utils {
  export type Version = GodotVersion;
  export type Type = ResourceType;
  export type EncodeOpts = EncodeOptions;
  export type DecodeOpts = DecodeOptions;
}