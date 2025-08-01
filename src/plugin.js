/**
 * wx-calendar 日期范围标记插件
 * 参考 wc-plugin-ics 的设计模式，优化 TaroJS 微信小程序集成
 * 支持跨日期连续显示、多种标记类型、丰富的交互功能
 */

const DATE_RANGE_PLUGIN_KEY = 'dateRange';

class DateRangePlugin {
  /**
   * 默认配置
   */
  static defaultOptions = {
    // 基础配置
    ranges: [],
    markAs: 'schedule',
    defaultColor: '#667eea',
    defaultBgColor: '#f0f2ff',
    clickable: true,
    
    // 内容显示配置
    showContent: false,
    contentMarkAs: 'schedule',
    contentDefaultColor: '#666666',
    contentDefaultBgColor: '#ffffff',
    contentDefaultFontSize: '12px',
    contentDefaultPadding: '4px 8px',
    contentDefaultBorderRadius: '4px',
    contentDefaultLineHeight: '1.4',
    maxContentLines: 3,
    
    // 跨日期显示配置
    contentSpanMode: 'single', // 'single' | 'span'
    contentAlignment: 'left',   // 'left' | 'center' | 'right'
    spanContentStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '12px',
      color: '#333',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      zIndex: 10
    },
    
    // 事件回调
    onRangeClick: null,
    onDateClick: null,
    onRangeAdd: null,
    onRangeRemove: null,
    
    // TaroJS 优化配置
    enableTaroOptimization: false,
    batchUpdateDelay: 100, // 批量更新延迟（毫秒）
    maxRangesPerBatch: 50  // 每批最大处理范围数
  };

  constructor(calendar, options = {}) {
    this.calendar = calendar;
    this.options = this.mergeOptions(options);
    
    // 内部状态
    this.ranges = [];
    this.rangeMap = new Map(); // 日期 -> 范围列表
    this.markMap = new Map();  // 标记key -> 范围
    this.isDestroyed = false;
    this.updateTimer = null;
    
    // TaroJS 优化
    if (this.options.enableTaroOptimization) {
      this.initTaroOptimizations();
    }
    
    // 初始化
    this.init();
  }

  /**
   * 合并配置选项
   */
  mergeOptions(options) {
    const merged = {
      ...DateRangePlugin.defaultOptions,
      ...options
    };
    
    // 深度合并样式对象
    if (options.spanContentStyle) {
      merged.spanContentStyle = {
        ...DateRangePlugin.defaultOptions.spanContentStyle,
        ...options.spanContentStyle
      };
    }
    
    return merged;
  }

  /**
   * 初始化 TaroJS 优化
   */
  initTaroOptimizations() {
    // 监听小程序生命周期
    if (typeof wx !== 'undefined') {
      // 监听页面隐藏，暂停更新
      const originalOnHide = getCurrentPages().slice(-1)[0]?.onHide;
      if (originalOnHide) {
        getCurrentPages().slice(-1)[0].onHide = () => {
          this.pause();
          originalOnHide.call(getCurrentPages().slice(-1)[0]);
        };
      }
      
      // 监听页面显示，恢复更新
      const originalOnShow = getCurrentPages().slice(-1)[0]?.onShow;
      if (originalOnShow) {
        getCurrentPages().slice(-1)[0].onShow = () => {
          this.resume();
          originalOnShow.call(getCurrentPages().slice(-1)[0]);
        };
      }
    }
  }

  /**
   * 初始化插件
   */
  init() {
    if (this.isDestroyed) return;
    
    // 处理初始范围
    if (this.options.ranges && this.options.ranges.length > 0) {
      this.loadRanges(this.options.ranges);
    }
    
    // 绑定事件
    this.bindEvents();
  }

  /**
   * 加载范围数据（类似 ICS 插件的 load 方法）
   */
  load(ranges) {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(ranges)) {
          ranges = [ranges];
        }
        
        this.loadRanges(ranges);
        resolve(this.ranges.length);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 批量加载范围
   */
  loadRanges(ranges) {
    if (!Array.isArray(ranges)) {
      throw new Error('Ranges must be an array');
    }
    
    // 验证范围数据
    ranges.forEach((range, index) => {
      this.validateRange(range, index);
    });
    
    // 清空现有范围
    this.ranges = [];
    this.rangeMap.clear();
    this.markMap.clear();
    
    // 批量添加范围
    if (this.options.enableTaroOptimization && ranges.length > this.options.maxRangesPerBatch) {
      this.batchAddRanges(ranges);
    } else {
      ranges.forEach(range => {
        this.ranges.push(range);
      });
      this.refresh();
    }
    
    // 触发加载完成事件
    this.triggerEvent('rangesLoaded', { count: ranges.length });
  }

  /**
   * 批量添加范围（TaroJS 优化）
   */
  batchAddRanges(ranges) {
    const batches = [];
    for (let i = 0; i < ranges.length; i += this.options.maxRangesPerBatch) {
      batches.push(ranges.slice(i, i + this.options.maxRangesPerBatch));
    }
    
    let currentBatch = 0;
    const processBatch = () => {
      if (currentBatch >= batches.length || this.isDestroyed) return;
      
      const batch = batches[currentBatch];
      batch.forEach(range => {
        this.ranges.push(range);
      });
      
      this.refresh();
      currentBatch++;
      
      if (currentBatch < batches.length) {
        setTimeout(processBatch, this.options.batchUpdateDelay);
      }
    };
    
    processBatch();
  }

  /**
   * 验证范围数据
   */
  validateRange(range, index) {
    if (!range.code) {
      throw new Error(`Range at index ${index} must have a code property`);
    }
    if (!range.name) {
      throw new Error(`Range at index ${index} must have a name property`);
    }
    if (!range.startDate || !range.endDate) {
      throw new Error(`Range at index ${index} must have startDate and endDate properties`);
    }
    
    // 验证日期格式
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error(`Range at index ${index} has invalid date format`);
    }
    
    if (startDate > endDate) {
      throw new Error(`Range at index ${index}: startDate must be before or equal to endDate`);
    }
  }

  /**
   * 添加单个范围
   */
  add(range) {
    if (this.isDestroyed) return this;
    
    this.validateRange(range, this.ranges.length);
    
    // 检查是否已存在相同code的范围
    const existingIndex = this.ranges.findIndex(r => r.code === range.code);
    if (existingIndex !== -1) {
      throw new Error(`Range with code '${range.code}' already exists`);
    }
    
    this.ranges.push(range);
    this.scheduleUpdate();
    
    // 触发事件
    this.triggerEvent('rangeAdded', { range });
    if (this.options.onRangeAdd) {
      this.options.onRangeAdd(range);
    }
    
    return this;
  }

  /**
   * 删除范围
   */
  remove(code) {
    if (this.isDestroyed) return false;
    
    const initialLength = this.ranges.length;
    const removedRange = this.ranges.find(r => r.code === code);
    this.ranges = this.ranges.filter(range => range.code !== code);
    
    if (this.ranges.length === initialLength) {
      console.warn(`Range with code '${code}' not found`);
      return false;
    }
    
    this.scheduleUpdate();
    
    // 触发事件
    this.triggerEvent('rangeRemoved', { code, range: removedRange });
    if (this.options.onRangeRemove) {
      this.options.onRangeRemove(code, removedRange);
    }
    
    return true;
  }

  /**
   * 更新范围
   */
  update(code, newRange) {
    if (this.isDestroyed) return this;
    
    const index = this.ranges.findIndex(range => range.code === code);
    
    if (index === -1) {
      throw new Error(`Range with code '${code}' not found`);
    }
    
    // 保持原有的code
    this.ranges[index] = { ...newRange, code };
    this.scheduleUpdate();
    
    // 触发事件
    this.triggerEvent('rangeUpdated', { code, range: this.ranges[index] });
    
    return this;
  }

  /**
   * 清空所有范围
   */
  clear() {
    if (this.isDestroyed) return this;
    
    const count = this.ranges.length;
    this.ranges = [];
    this.rangeMap.clear();
    this.markMap.clear();
    
    this.refresh();
    
    // 触发事件
    this.triggerEvent('rangesCleared', { count });
    
    return this;
  }

  /**
   * 计划更新（防抖）
   */
  scheduleUpdate() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    
    this.updateTimer = setTimeout(() => {
      this.refresh();
      this.updateTimer = null;
    }, this.options.batchUpdateDelay);
  }

  /**
   * 暂停更新（TaroJS 优化）
   */
  pause() {
    this.isPaused = true;
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * 恢复更新（TaroJS 优化）
   */
  resume() {
    this.isPaused = false;
    this.refresh();
  }

  /**
   * 刷新日历标记
   */
  refresh() {
    if (this.isDestroyed || this.isPaused) return this;
    
    try {
      // 清除现有标记
      this.clearMarks();
      
      // 重新生成标记
      const marks = this.generateMarks();
      
      // 添加到日历
      if (marks.length > 0) {
        this.calendar.addMarks(marks);
      }
      
      // 处理内容显示
      if (this.options.showContent) {
        this.generateContentMarks();
      }
      
      // 触发刷新事件
      this.triggerEvent('refreshed', { marksCount: marks.length });
      
    } catch (error) {
      console.error('DateRangePlugin refresh error:', error);
      this.triggerEvent('error', { error, action: 'refresh' });
    }
    
    return this;
  }

  /**
   * 生成日历标记
   */
  generateMarks() {
    const marks = [];
    this.rangeMap.clear();
    this.markMap.clear();
    
    this.ranges.forEach(range => {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      
      // 生成日期范围内的所有日期
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = this.formatDate(currentDate);
        
        // 创建标记
        const mark = this.createMark(range, currentDate, startDate, endDate);
        marks.push(mark);
        
        // 存储映射关系
        if (!this.rangeMap.has(dateKey)) {
          this.rangeMap.set(dateKey, []);
        }
        this.rangeMap.get(dateKey).push(range);
        this.markMap.set(mark.key, range);
        
        // 移动到下一天
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return marks;
  }

  /**
   * 创建单个标记
   */
  createMark(range, currentDate, startDate, endDate) {
    const dateKey = this.formatDate(currentDate);
    const isStart = currentDate.getTime() === startDate.getTime();
    const isEnd = currentDate.getTime() === endDate.getTime();
    const isSingle = startDate.getTime() === endDate.getTime();
    
    // 确定标记样式
    let markAs = range.markAs || this.options.markAs;
    let color = range.color || this.options.defaultColor;
    let bgColor = range.bgColor || this.options.defaultBgColor;
    
    // 根据位置调整样式
    if (!isSingle) {
      if (isStart) {
        markAs = range.startMarkAs || markAs;
        color = range.startColor || color;
        bgColor = range.startBgColor || bgColor;
      } else if (isEnd) {
        markAs = range.endMarkAs || markAs;
        color = range.endColor || color;
        bgColor = range.endBgColor || bgColor;
      } else {
        markAs = range.middleMarkAs || markAs;
        color = range.middleColor || color;
        bgColor = range.middleBgColor || bgColor;
      }
    }
    
    return {
      key: `${range.code}_${dateKey}`,
      date: dateKey,
      markAs,
      color,
      bgColor,
      data: {
        range,
        isStart,
        isEnd,
        isSingle,
        position: isSingle ? 'single' : (isStart ? 'start' : (isEnd ? 'end' : 'middle'))
      }
    };
  }

  /**
   * 生成内容标记
   */
  generateContentMarks() {
    if (!this.options.showContent) return;
    
    const contentMarks = [];
    
    if (this.options.contentSpanMode === 'span') {
      // 跨日期连续显示模式
      contentMarks.push(...this.generateSpanContentMarks());
    } else {
      // 单日显示模式
      contentMarks.push(...this.generateSingleContentMarks());
    }
    
    if (contentMarks.length > 0) {
      this.calendar.addMarks(contentMarks);
    }
  }

  /**
   * 生成单日内容标记
   */
  generateSingleContentMarks() {
    const marks = [];
    
    this.ranges.forEach(range => {
      if (!range.content) return;
      
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateKey = this.formatDate(currentDate);
        
        const mark = {
          key: `${range.code}_content_${dateKey}`,
          date: dateKey,
          markAs: range.contentMarkAs || this.options.contentMarkAs,
          color: range.contentColor || this.options.contentDefaultColor,
          bgColor: range.contentBgColor || this.options.contentDefaultBgColor,
          content: this.formatContent(range.content, range),
          style: this.getContentStyle(range),
          data: {
            range,
            type: 'content'
          }
        };
        
        marks.push(mark);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return marks;
  }

  /**
   * 生成跨日期内容标记
   */
  generateSpanContentMarks() {
    const marks = [];
    
    this.ranges.forEach(range => {
      if (!range.content) return;
      
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      
      // 只在开始日期显示内容
      const dateKey = this.formatDate(startDate);
      const spanDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      const mark = {
        key: `${range.code}_span_content_${dateKey}`,
        date: dateKey,
        markAs: range.contentMarkAs || this.options.contentMarkAs,
        color: range.contentColor || this.options.contentDefaultColor,
        bgColor: range.contentBgColor || this.options.contentDefaultBgColor,
        content: this.formatContent(range.content, range),
        style: {
          ...this.options.spanContentStyle,
          ...this.getContentStyle(range),
          width: `${spanDays * 100}%`,
          position: 'absolute',
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)'
        },
        data: {
          range,
          type: 'spanContent',
          spanDays
        }
      };
      
      marks.push(mark);
    });
    
    return marks;
  }

  /**
   * 格式化内容
   */
  formatContent(content, range) {
    if (typeof content === 'function') {
      return content(range);
    }
    
    if (Array.isArray(content)) {
      return content.slice(0, this.options.maxContentLines).join('\n');
    }
    
    return String(content);
  }

  /**
   * 获取内容样式
   */
  getContentStyle(range) {
    const style = {
      fontSize: range.contentFontSize || this.options.contentDefaultFontSize,
      padding: range.contentPadding || this.options.contentDefaultPadding,
      borderRadius: range.contentBorderRadius || this.options.contentDefaultBorderRadius,
      lineHeight: range.contentLineHeight || this.options.contentDefaultLineHeight
    };
    
    if (range.contentStyle) {
      Object.assign(style, range.contentStyle);
    }
    
    return style;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.options.clickable) return;
    
    // 绑定日历点击事件
    this.calendar.on('markClick', this.handleMarkClick.bind(this));
    this.calendar.on('dateClick', this.handleDateClick.bind(this));
  }

  /**
   * 处理标记点击
   */
  handleMarkClick(event) {
    const { mark } = event;
    
    if (!mark.key || !this.markMap.has(mark.key)) return;
    
    const range = this.markMap.get(mark.key);
    const clickEvent = {
      range,
      mark,
      date: mark.date,
      originalEvent: event
    };
    
    // 触发范围点击事件
    this.triggerEvent('rangeClick', clickEvent);
    
    if (this.options.onRangeClick) {
      this.options.onRangeClick(clickEvent);
    }
  }

  /**
   * 处理日期点击
   */
  handleDateClick(event) {
    const { date } = event;
    const dateKey = this.formatDate(new Date(date));
    const ranges = this.rangeMap.get(dateKey) || [];
    
    const clickEvent = {
      date,
      ranges,
      originalEvent: event
    };
    
    // 触发日期点击事件
    this.triggerEvent('dateClick', clickEvent);
    
    if (this.options.onDateClick) {
      this.options.onDateClick(clickEvent);
    }
  }

  /**
   * 清除标记
   */
  clearMarks() {
    // 清除所有相关标记
    const markKeys = Array.from(this.markMap.keys());
    markKeys.forEach(key => {
      this.calendar.removeMark(key);
    });
    
    // 清除内容标记
    this.ranges.forEach(range => {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateKey = this.formatDate(currentDate);
        this.calendar.removeMark(`${range.code}_content_${dateKey}`);
        this.calendar.removeMark(`${range.code}_span_content_${dateKey}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  /**
   * 获取范围信息
   */
  getInfo() {
    return {
      ranges: [...this.ranges],
      rangeCount: this.ranges.length,
      dateCount: this.rangeMap.size,
      markCount: this.markMap.size,
      options: { ...this.options },
      isDestroyed: this.isDestroyed,
      isPaused: this.isPaused || false
    };
  }

  /**
   * 获取指定日期的范围
   */
  getRangesForDate(date) {
    const dateKey = this.formatDate(new Date(date));
    return this.rangeMap.get(dateKey) || [];
  }

  /**
   * 获取指定范围
   */
  getRange(code) {
    return this.ranges.find(range => range.code === code) || null;
  }

  /**
   * 检查日期是否在范围内
   */
  isDateInRange(date, rangeCode) {
    const range = this.getRange(rangeCode);
    if (!range) return false;
    
    const checkDate = new Date(date);
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    
    return checkDate >= startDate && checkDate <= endDate;
  }

  /**
   * 格式化日期
   */
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 触发事件
   */
  triggerEvent(eventName, data) {
    if (this.calendar && typeof this.calendar.trigger === 'function') {
      this.calendar.trigger(`dateRange:${eventName}`, data);
    }
  }

  /**
   * 销毁插件
   */
  destroy() {
    if (this.isDestroyed) return;
    
    // 清理定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    
    // 清除标记
    this.clearMarks();
    
    // 清理数据
    this.ranges = [];
    this.rangeMap.clear();
    this.markMap.clear();
    
    // 解绑事件
    if (this.calendar) {
      this.calendar.off('markClick', this.handleMarkClick);
      this.calendar.off('dateClick', this.handleDateClick);
    }
    
    // 标记为已销毁
    this.isDestroyed = true;
    
    // 触发销毁事件
    this.triggerEvent('destroyed', {});
  }
}

// 导出插件类和常量
export { DateRangePlugin, DATE_RANGE_PLUGIN_KEY };