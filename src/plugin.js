/**
 * wx-calendar 日期范围标记插件
 * 支持多个日期范围标记，点击交互，颜色自定义等功能
 */

const DATE_RANGE_PLUGIN_KEY = 'dateRange';

class DateRangePlugin {
  constructor(calendar, options = {}) {
    this.calendar = calendar;
    this.options = {
      ranges: [],
      markAs: 'festival',
      defaultColor: '#333333',
      defaultBgColor: '#f5f5f5',
      onRangeClick: null,
      // 新增内容显示配置
      showContent: true,
      contentMarkAs: 'schedule',
      contentDefaultColor: '#666666',
      contentDefaultBgColor: '#ffffff',
      contentDefaultFontSize: '12px',
      contentDefaultPadding: '4px',
      contentDefaultBorderRadius: '4px',
      contentDefaultLineHeight: '1.4',
      maxContentLines: 3,
      ...options
    };
    
    this.ranges = this.options.ranges || [];
    this.rangeMap = new Map(); // 存储日期到范围的映射
    this.markMap = new Map(); // 存储标记到范围的映射
    
    this.init();
  }

  /**
   * 初始化插件
   */
  init() {
    // 验证范围数据
    this.validateRanges();
    
    // 处理日期范围，生成标记数据
    const marks = this.generateMarks();
    
    // 将标记添加到日历
    this.calendar.addMarks(marks);
    
    // 绑定点击事件
    this.bindClickEvents();
  }

  /**
   * 验证范围数据
   */
  validateRanges() {
    this.ranges.forEach((range, index) => {
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
    });
  }

  /**
   * 生成标记数据
   */
  generateMarks() {
    const marks = [];
    this.rangeMap.clear();
    this.markMap.clear();
    
    this.ranges.forEach(range => {
      const dates = this.getDatesBetween(range.startDate, range.endDate);
      
      dates.forEach(date => {
        // 存储日期到范围的映射
        if (!this.rangeMap.has(date)) {
          this.rangeMap.set(date, []);
        }
        this.rangeMap.get(date).push(range);
        
        // 生成范围标记
        const markKey = `${range.code}-${date}`;
        const rangeMark = {
          date: date,
          type: this.options.markAs,
          text: range.name,
          style: {
            color: range.color || this.options.defaultColor,
            backgroundColor: range.bgColor || this.options.defaultBgColor,
            cursor: range.clickable !== false ? 'pointer' : 'default'
          },
          key: range.key || markKey,
          clickable: range.clickable !== false,
          rangeCode: range.code,
          rangeData: range.data,
          markType: 'range'
        };
        
        marks.push(rangeMark);
        this.markMap.set(markKey, range);
        
        // 生成内容标记
        if (this.options.showContent && this.shouldShowContent(range, date)) {
          const contentMarks = this.generateContentMarks(range, date);
          marks.push(...contentMarks);
        }
      });
    });
    
    return marks;
  }

  /**
   * 判断是否应该显示内容
   */
  shouldShowContent(range, date) {
    // 如果有 content 或 contents 字段，则显示内容
    return range.content || range.contents;
  }

  /**
   * 生成内容标记
   */
  generateContentMarks(range, date) {
    const contentMarks = [];
    
    if (range.content) {
      // 单个内容项
      const contentMark = this.createContentMark(range, date, range.content, 0);
      contentMarks.push(contentMark);
    } else if (range.contents && Array.isArray(range.contents)) {
      // 多个内容项
      range.contents.forEach((content, index) => {
        if (index < this.options.maxContentLines) {
          const contentMark = this.createContentMark(range, date, content, index);
          contentMarks.push(contentMark);
        }
      });
    }
    
    return contentMarks;
  }

  /**
   * 创建内容标记
   */
  createContentMark(range, date, content, index) {
    const contentKey = `${range.code}-${date}-content-${index}`;
    
    // 处理内容文本
    let text = '';
    let style = {};
    
    if (typeof content === 'string') {
      text = content;
      style = this.getDefaultContentStyle();
    } else if (typeof content === 'object') {
      text = content.text || '';
      style = {
        ...this.getDefaultContentStyle(),
        ...content.style
      };
      
      // 支持直接在 content 对象上设置颜色
      if (content.color) {
        style.color = content.color;
      }
      if (content.bgColor || content.backgroundColor) {
        style.backgroundColor = content.bgColor || content.backgroundColor;
      }
    }
    
    return {
      date: date,
      type: this.options.contentMarkAs,
      text: text,
      style: style,
      key: contentKey,
      clickable: range.clickable !== false,
      rangeCode: range.code,
      rangeData: range.data,
      markType: 'content',
      contentIndex: index
    };
  }

  /**
   * 获取默认内容样式
   */
  getDefaultContentStyle() {
    return {
      color: this.options.contentDefaultColor,
      backgroundColor: this.options.contentDefaultBgColor,
      fontSize: this.options.contentDefaultFontSize,
      padding: this.options.contentDefaultPadding,
      borderRadius: this.options.contentDefaultBorderRadius,
      lineHeight: this.options.contentDefaultLineHeight,
      cursor: 'pointer'
    };
  }

  /**
   * 绑定点击事件
   */
  bindClickEvents() {
    // 监听日历的标记点击事件
    this.calendar.on('markClick', (event) => {
      const { date, mark } = event;
      
      if (mark.clickable && mark.rangeCode) {
        const ranges = this.rangeMap.get(date) || [];
        const targetRange = ranges.find(r => r.code === mark.rangeCode);
        
        if (targetRange) {
          // 调用全局点击回调
          if (this.options.onRangeClick) {
            this.options.onRangeClick(targetRange, date);
          }
          
          // 触发自定义事件
          this.calendar.triggerEvent('rangeClick', {
            range: targetRange,
            date: date,
            code: mark.rangeCode,
            data: mark.rangeData
          });
        }
      }
    });
  }

  /**
   * 获取两个日期之间的所有日期
   */
  getDatesBetween(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  /**
   * 动态添加范围
   */
  addRange(range) {
    if (!range.code) {
      throw new Error('Range must have a code property');
    }
    
    // 检查是否已存在相同code的范围
    const existingIndex = this.ranges.findIndex(r => r.code === range.code);
    if (existingIndex !== -1) {
      throw new Error(`Range with code '${range.code}' already exists`);
    }
    
    this.ranges.push(range);
    this.refresh();
    
    return this;
  }

  /**
   * 根据code删除范围
   */
  removeRange(code) {
    const initialLength = this.ranges.length;
    this.ranges = this.ranges.filter(range => range.code !== code);
    
    if (this.ranges.length === initialLength) {
      console.warn(`Range with code '${code}' not found`);
      return false;
    }
    
    this.refresh();
    return true;
  }

  /**
   * 更新范围
   */
  updateRange(code, newRange) {
    const index = this.ranges.findIndex(range => range.code === code);
    
    if (index === -1) {
      throw new Error(`Range with code '${code}' not found`);
    }
    
    // 保持原有的code
    this.ranges[index] = { ...newRange, code };
    this.refresh();
    
    return this;
  }

  /**
   * 根据code获取范围
   */
  getRangeByCode(code) {
    return this.ranges.find(range => range.code === code);
  }

  /**
   * 获取指定日期的所有范围
   */
  getRangesByDate(date) {
    return this.rangeMap.get(date) || [];
  }

  /**
   * 获取所有范围
   */
  getRanges() {
    return [...this.ranges];
  }

  /**
   * 清空所有范围
   */
  clearRanges() {
    this.ranges = [];
    this.refresh();
    return this;
  }

  /**
   * 刷新标记
   */
  refresh() {
    // 清除旧的标记
    this.calendar.clearMarks();
    
    // 重新生成和添加标记
    const marks = this.generateMarks();
    this.calendar.addMarks(marks);
    
    // 重新绑定事件
    this.bindClickEvents();
    
    return this;
  }

  /**
   * 销毁插件
   */
  destroy() {
    this.calendar.off('markClick');
    this.calendar.clearMarks();
    this.rangeMap.clear();
    this.markMap.clear();
    this.ranges = [];
  }

  /**
   * 获取插件信息
   */
  getInfo() {
    return {
      name: 'DateRangePlugin',
      version: '1.0.0',
      key: DATE_RANGE_PLUGIN_KEY,
      rangeCount: this.ranges.length,
      totalDates: Array.from(this.rangeMap.keys()).length
    };
  }
}

module.exports = {
  DateRangePlugin,
  DATE_RANGE_PLUGIN_KEY
};