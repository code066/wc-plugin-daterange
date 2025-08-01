/**
 * wx-calendar 日期范围插件 TypeScript 类型定义
 */

export interface ContentItem {
  /** 显示文本 */
  text: string;
  /** 文字颜色 */
  color?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 背景颜色（别名） */
  backgroundColor?: string;
  /** 自定义样式 */
  style?: {
    fontSize?: string;
    padding?: string;
    borderRadius?: string;
    lineHeight?: string;
    [key: string]: any;
  };
}

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
  /** 单个内容项 */
  content?: string | ContentItem;
  /** 多个内容项 */
  contents?: (string | ContentItem)[];
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
  /** 是否显示内容 */
  showContent?: boolean;
  /** 内容标记类型 */
  contentMarkAs?: 'schedule' | 'corner' | 'festival';
  /** 内容默认文字颜色 */
  contentDefaultColor?: string;
  /** 内容默认背景颜色 */
  contentDefaultBgColor?: string;
  /** 内容默认字体大小 */
  contentDefaultFontSize?: string;
  /** 内容默认内边距 */
  contentDefaultPadding?: string;
  /** 内容默认圆角 */
  contentDefaultBorderRadius?: string;
  /** 内容默认行高 */
  contentDefaultLineHeight?: string;
  /** 最大内容行数 */
  maxContentLines?: number;
  /** 内容显示模式 */
  contentSpanMode?: 'single' | 'span';
  /** 内容对齐方式 */
  contentAlignment?: 'left' | 'center' | 'right';
  /** 跨日期内容样式 */
  spanContentStyle?: {
    backgroundColor?: string;
    border?: string;
    padding?: string;
    fontSize?: string;
    color?: string;
    boxShadow?: string;
    zIndex?: number;
    borderRadius?: string;
    lineHeight?: string;
  };
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
    fontSize?: string;
    padding?: string;
    borderRadius?: string;
    lineHeight?: string;
    position?: string;
    whiteSpace?: string;
    overflow?: string;
    textOverflow?: string;
    border?: string;
    borderLeft?: string;
    borderRight?: string;
    boxShadow?: string;
    zIndex?: number;
    opacity?: string;
    [key: string]: any;
  };
  /** 标记键 */
  key: string;
  /** 是否可点击 */
  clickable: boolean;
  /** 范围代码 */
  rangeCode: string;
  /** 范围数据 */
  rangeData?: any;
  /** 标记类型：range 或 content */
  markType?: 'range' | 'content' | 'span-content';
  /** 内容索引（仅 content 类型） */
  contentIndex?: number;
  /** 周索引（仅 span-content 类型） */
  weekIndex?: number;
  /** 周组信息（仅 span-content 类型） */
  weekGroup?: {
    weekIndex: number;
    weekStartDate: string;
    weekEndDate: string;
    days: number;
    startDayOfWeek: number;
    isFirstWeek: boolean;
    isLastWeek: boolean;
    dates: string[];
  };
  /** 跨度维度信息 */
  spanDimensions?: {
    totalDays: number;
    weekGroups: Array<{
      weekIndex: number;
      weekStartDate: string;
      weekEndDate: string;
      days: number;
      startDayOfWeek: number;
      isFirstWeek: boolean;
      isLastWeek: boolean;
      dates: string[];
    }>;
    alignment: 'left' | 'center' | 'right';
  };
  /** 跨度信息 */
  spanInfo?: {
    totalDays: number;
    weekGroups: Array<{
      weekIndex: number;
      weekStartDate: string;
      weekEndDate: string;
      days: number;
      startDayOfWeek: number;
      isFirstWeek: boolean;
      isLastWeek: boolean;
      dates: string[];
    }>;
    alignment: 'left' | 'center' | 'right';
    isMultiWeek: boolean;
    currentWeek: number;
    totalWeeks: number;
  };
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