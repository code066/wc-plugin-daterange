/**
 * wx-calendar 日期范围标记插件
 * 支持多个日期范围标记，点击交互，颜色自定义等功能
 */

const DATE_RANGE_PLUGIN_KEY = 'dateRange';

class DateRangePlugin {
  /**
   * 默认配置
   */
  static defaultOptions = {
    ranges: [],
    markAs: 'schedule',
    defaultColor: '#667eea',
    defaultBgColor: '#f0f2ff',
    clickable: true,
    onRangeClick: null,
    
    // 内容显示相关配置
    showContent: false,
    contentMarkAs: 'schedule',
    contentDefaultColor: '#666666',
    contentDefaultBgColor: '#ffffff',
    contentDefaultFontSize: '12px',
    contentDefaultPadding: '4px',
    contentDefaultBorderRadius: '4px',
    contentDefaultLineHeight: '1.4',
    maxContentLines: 3,
    
    // 跨日期内容显示配置
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
    }
  };

  constructor(calendar, options = {}) {
    this.calendar = calendar;
    this.options = {
      ...DateRangePlugin.defaultOptions,
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
      });
      
      // 生成内容标记
      if (this.options.showContent && this.shouldShowContent(range)) {
        if (this.options.contentSpanMode === 'span') {
          // 跨日期模式：只在第一个日期生成跨日内容标记
          const spanContentMarks = this.generateSpanContentMarks(range);
          marks.push(...spanContentMarks);
        } else {
          // 单日模式：在每个日期生成内容标记
          dates.forEach(date => {
            const contentMarks = this.generateContentMarks(range, date);
            marks.push(...contentMarks);
          });
        }
      }
    });
    
    return marks;
  }

  /**
   * 判断是否应该显示内容
   */
  shouldShowContent(range) {
    // 如果有 content 或 contents 字段，则显示内容
    return range.content || range.contents;
  }

  /**
   * 生成跨日期内容标记
   */
  generateSpanContentMarks(range) {
    const contentMarks = [];
    const spanDimensions = this.calculateSpanDimensions(range);
    
    if (range.content) {
      // 单个内容项 - 为每个周组生成标记
      spanDimensions.weekGroups.forEach((weekGroup, weekIndex) => {
        const contentMark = this.createSpanContentMark(range, weekGroup, range.content, 0, spanDimensions, weekIndex);
        contentMarks.push(contentMark);
      });
    } else if (range.contents && Array.isArray(range.contents)) {
      // 多个内容项 - 为每个内容项的每个周组生成标记
      range.contents.forEach((content, contentIndex) => {
        if (contentIndex < this.options.maxContentLines) {
          spanDimensions.weekGroups.forEach((weekGroup, weekIndex) => {
            const contentMark = this.createSpanContentMark(range, weekGroup, content, contentIndex, spanDimensions, weekIndex);
            contentMarks.push(contentMark);
          });
        }
      });
    }
    
    return contentMarks;
  }

  /**
   * 计算跨日期内容的尺寸和位置（按周分组）
   */
  calculateSpanDimensions(range) {
    const dates = this.getDatesBetween(range.startDate, range.endDate);
    const totalDays = dates.length;
    
    // 按周分组日期
    const weekGroups = [];
    const datesByWeek = new Map();
    
    // 将日期按周分组
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // 计算该日期所在周的周一日期作为周标识
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ...
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 计算到周一的偏移
      const monday = new Date(date);
      monday.setDate(date.getDate() + mondayOffset);
      
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!datesByWeek.has(weekKey)) {
        datesByWeek.set(weekKey, []);
      }
      datesByWeek.get(weekKey).push(dateStr);
    });
    
    // 转换为周组信息
    let weekIndex = 0;
    for (const [weekKey, weekDates] of datesByWeek) {
      weekDates.sort(); // 确保日期排序
      
      const firstDate = new Date(weekDates[0]);
      const lastDate = new Date(weekDates[weekDates.length - 1]);
      const startDayOfWeek = firstDate.getDay();
      
      weekGroups.push({
        weekIndex: weekIndex,
        weekStartDate: weekDates[0],
        weekEndDate: weekDates[weekDates.length - 1],
        days: weekDates.length,
        startDayOfWeek: startDayOfWeek,
        isFirstWeek: weekIndex === 0,
        isLastWeek: weekIndex === datesByWeek.size - 1,
        dates: weekDates
      });
      
      weekIndex++;
    }
    
    return {
      totalDays,
      weekGroups,
      alignment: this.options.contentAlignment
    };
  }

  /**
   * 创建跨日期内容标记
   */
  createSpanContentMark(range, weekGroup, content, contentIndex, spanDimensions, weekIndex) {
    const contentKey = `${range.code}-${weekGroup.weekStartDate}-span-content-${contentIndex}-week-${weekIndex}`;
    
    // 处理内容文本
    let text = '';
    let customStyle = {};
    
    if (typeof content === 'string') {
      text = content;
    } else if (typeof content === 'object') {
      text = content.text || '';
      customStyle = content.style || {};
      
      // 支持直接在 content 对象上设置颜色
      if (content.color) {
        customStyle.color = content.color;
      }
      if (content.bgColor || content.backgroundColor) {
        customStyle.backgroundColor = content.bgColor || content.backgroundColor;
      }
    }
    
    // 为跨周内容添加视觉标识
    const isMultiWeek = spanDimensions.weekGroups.length > 1;
    if (isMultiWeek) {
      if (weekGroup.isFirstWeek) {
        text = text; // 第一周显示完整文本
      } else if (weekGroup.isLastWeek) {
        text = `...${text.slice(-15)}`; // 最后一周显示结尾
      } else {
        text = '...'; // 中间周显示省略号
      }
    }
    
    // 合并样式
    const style = {
      ...this.options.spanContentStyle,
      ...customStyle,
      position: 'absolute',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };
    
    // 为不同周添加视觉区分样式
    if (isMultiWeek) {
      if (weekGroup.isFirstWeek) {
        // 第一周：右边虚线边框
        style.borderRight = '1px dashed #4a90e2';
      } else if (weekGroup.isLastWeek) {
        // 最后一周：左边虚线边框
        style.borderLeft = '1px dashed #4a90e2';
      } else {
        // 中间周：两边虚线边框，降低透明度
        style.borderLeft = '1px dashed #4a90e2';
        style.borderRight = '1px dashed #4a90e2';
        style.opacity = 0.8;
      }
      
      // 为所有跨周内容添加特殊的边框样式以增强视觉连续性
      style.boxShadow = '0 1px 3px rgba(74, 144, 226, 0.2)';
    }
    
    return {
      date: weekGroup.weekStartDate,
      type: this.options.contentMarkAs,
      text: text,
      style: style,
      key: contentKey,
      clickable: range.clickable !== false,
      rangeCode: range.code,
      rangeData: range.data,
      markType: 'span-content',
      contentIndex: contentIndex,
      weekIndex: weekIndex,
      weekGroup: weekGroup,
      spanDimensions: spanDimensions,
      spanInfo: {
        totalDays: spanDimensions.totalDays,
        weekGroups: spanDimensions.weekGroups,
        alignment: spanDimensions.alignment,
        isMultiWeek: spanDimensions.weekGroups.length > 1,
        currentWeek: weekIndex + 1,
        totalWeeks: spanDimensions.weekGroups.length
      }
    };
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