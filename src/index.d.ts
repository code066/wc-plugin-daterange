/**
 * wx-calendar 日期范围插件 TypeScript 类型定义
 */

export interface DateRange {
  /** 显示的名字 */
  name: string;
  /** 范围代码，用于数据调用 */
  code: string;
  /** 开始日期 YYYY-MM-DD */
  startDate: string;
  /** 结束日期 YYYY-MM-DD */
  endDate: string;
  /** 文字颜色 */
  color?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 唯一标识符 */
  key?: string;
  /** 是否可点击，默认 true */
  clickable?: boolean;
  /** 附加数据 */
  data?: any;
}

export interface PluginOptions {
  /** 日期范围数组 */
  ranges: DateRange[];
  /** 标记类型 */
  markAs?: 'schedule' | 'corner' | 'festival';
  /** 默认文字颜色 */
  defaultColor?: string;
  /** 默认背景颜色 */
  defaultBgColor?: string;
  /** 范围点击回调 */
  onRangeClick?: (range: DateRange, date: string) => void;
}

export interface RangeClickEvent {
  /** 范围信息 */
  range: DateRange;
  /** 点击的日期 */
  date: string;
  /** 范围代码 */
  code: string;
  /** 附加数据 */
  data?: any;
}

export interface CalendarMark {
  /** 日期 */
  date: string;
  /** 标记类型 */
  type: 'schedule' | 'corner' | 'festival';
  /** 显示文本 */
  text: string;
  /** 样式 */
  style: {
    color: string;
    backgroundColor: string;
    cursor: string;
  };
  /** 标记键 */
  key: string;
  /** 是否可点击 */
  clickable: boolean;
  /** 范围代码 */
  rangeCode: string;
  /** 范围数据 */
  rangeData?: any;
}

export interface PluginInfo {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 插件键 */
  key: string;
  /** 范围数量 */
  rangeCount: number;
  /** 总日期数 */
  totalDates: number;
}

export declare class DateRangePlugin {
  constructor(calendar: any, options?: PluginOptions);
  
  /** 初始化插件 */
  init(): void;
  
  /** 验证范围数据 */
  validateRanges(): void;
  
  /** 生成标记数据 */
  generateMarks(): CalendarMark[];
  
  /** 绑定点击事件 */
  bindClickEvents(): void;
  
  /** 获取两个日期之间的所有日期 */
  getDatesBetween(startDate: string, endDate: string): string[];
  
  /** 动态添加范围 */
  addRange(range: DateRange): DateRangePlugin;
  
  /** 根据code删除范围 */
  removeRange(code: string): boolean;
  
  /** 更新范围 */
  updateRange(code: string, newRange: DateRange): DateRangePlugin;
  
  /** 根据code获取范围 */
  getRangeByCode(code: string): DateRange | undefined;
  
  /** 获取指定日期的所有范围 */
  getRangesByDate(date: string): DateRange[];
  
  /** 获取所有范围 */
  getRanges(): DateRange[];
  
  /** 清空所有范围 */
  clearRanges(): DateRangePlugin;
  
  /** 刷新标记 */
  refresh(): DateRangePlugin;
  
  /** 销毁插件 */
  destroy(): void;
  
  /** 获取插件信息 */
  getInfo(): PluginInfo;
}

export declare const DATE_RANGE_PLUGIN_KEY: string;

export default DateRangePlugin;