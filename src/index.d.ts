/**
 * TypeScript 类型定义文件
 * 参考 wc-plugin-ics 的设计模式
 */

export interface DateRange {
  /** 唯一标识符 */
  code: string;
  /** 显示名称 */
  name: string;
  /** 开始日期 (YYYY-MM-DD) */
  startDate: string;
  /** 结束日期 (YYYY-MM-DD) */
  endDate: string;
  /** 内容描述 */
  content?: string;
  /** 文字颜色 */
  color?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 优先级 */
  priority?: 'high' | 'medium' | 'low';
  /** 状态 */
  status?: 'pending' | 'in-progress' | 'completed';
  /** 附加数据 */
  data?: any;
}

export interface DateRangeOptions {
  // TaroJS 优化
  /** 启用 TaroJS 优化 */
  enableTaroOptimization?: boolean;
  /** 批量更新延迟（毫秒） */
  batchUpdateDelay?: number;
  /** 每批最大范围数量 */
  maxRangesPerBatch?: number;
  
  // 显示配置
  /** 显示内容文本 */
  showContent?: boolean;
  /** 内容显示模式 */
  contentSpanMode?: 'tooltip' | 'span';
  
  // 样式配置
  /** 默认文字颜色 */
  defaultColor?: string;
  /** 默认背景颜色 */
  defaultBgColor?: string;
  
  // 事件回调
  /** 范围点击事件 */
  onRangeClick?: (event: RangeClickEvent) => void;
  /** 日期点击事件 */
  onDateClick?: (event: DateClickEvent) => void;
  /** 范围添加事件 */
  onRangeAdd?: (range: DateRange) => void;
  /** 范围删除事件 */
  onRangeRemove?: (code: string, range: DateRange) => void;
}

export interface RangeClickEvent {
  /** 点击的范围 */
  range: DateRange;
  /** 点击的日期 */
  date: string;
  /** 原始事件 */
  originalEvent?: any;
}

export interface DateClickEvent {
  /** 点击的日期 */
  date: string;
  /** 该日期包含的范围 */
  ranges: DateRange[];
  /** 原始事件 */
  originalEvent?: any;
}

export interface PluginInfo {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 范围列表 */
  ranges: DateRange[];
  /** 配置选项 */
  options: DateRangeOptions;
}

export interface PresetConfig {
  /** 默认颜色 */
  color: string;
  /** 默认背景颜色 */
  bgColor: string;
  /** 显示内容 */
  showContent: boolean;
  /** 内容显示模式 */
  contentSpanMode: 'tooltip' | 'span';
  /** 其他配置 */
  [key: string]: any;
}

/**
 * 日期范围插件类
 */
export declare class DateRangePlugin {
  constructor(calendar: any, options?: DateRangeOptions);
  
  /**
   * 批量加载日期范围数据
   * @param ranges 日期范围数组
   * @returns 加载的范围数量
   */
  load(ranges: DateRange[]): Promise<number>;
  
  /**
   * 添加单个日期范围
   * @param range 日期范围
   */
  add(range: DateRange): void;
  
  /**
   * 删除指定的日期范围
   * @param code 范围代码
   */
  remove(code: string): void;
  
  /**
   * 更新指定的日期范围
   * @param code 范围代码
   * @param updates 更新数据
   */
  update(code: string, updates: Partial<DateRange>): void;
  
  /**
   * 清空所有日期范围
   */
  clear(): void;
  
  /**
   * 刷新日历显示
   */
  refresh(): void;
  
  /**
   * 获取插件信息和统计数据
   */
  getInfo(): PluginInfo;
  
  /**
   * 获取指定日期的范围
   * @param date 日期字符串
   */
  getRangesForDate(date: string): DateRange[];
  
  /**
   * 获取指定代码的范围
   * @param code 范围代码
   */
  getRange(code: string): DateRange | null;
  
  /**
   * 检查日期是否在范围内
   * @param date 日期字符串
   * @param range 日期范围
   */
  isDateInRange(date: string, range: DateRange): boolean;
  
  /**
   * 暂停更新
   */
  pause(): void;
  
  /**
   * 恢复更新
   */
  resume(): void;
  
  /**
   * 销毁插件
   */
  destroy(): void;
}

/**
 * 插件标识符
 */
export declare const DATE_RANGE_PLUGIN_KEY: string;

/**
 * 项目管理预设
 */
export declare const ProjectManagementPreset: PresetConfig;

/**
 * 日程安排预设
 */
export declare const SchedulePreset: PresetConfig;

/**
 * 假期预设
 */
export declare const HolidayPreset: PresetConfig;

/**
 * 获取预设配置
 * @param presetName 预设名称
 */
export declare function getPreset(presetName: string): PresetConfig | null;

/**
 * 合并预设配置和选项
 * @param preset 预设配置
 * @param options 用户选项
 */
export declare function mergePresetWithOptions(preset: PresetConfig, options: Partial<DateRangeOptions>): DateRangeOptions;

// 默认导出
export default DateRangePlugin;