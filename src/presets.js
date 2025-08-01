/**
 * wx-calendar 日期范围插件预设配置
 * 参考 wc-plugin-ics 的预设模式，为常见场景提供开箱即用的配置
 */

/**
 * 项目管理预设
 * 适用于项目阶段管理、任务跟踪等场景
 */
const ProjectManagementPreset = {
  // 基础配置
  showContent: true,
  contentSpanMode: 'span',
  contentAlignment: 'left',
  maxContentLines: 3,
  
  // 样式配置
  contentDefaultColor: '#333333',
  contentDefaultBgColor: 'rgba(255, 255, 255, 0.95)',
  contentDefaultFontSize: '12px',
  contentDefaultPadding: '4px 8px',
  contentDefaultBorderRadius: '6px',
  
  // 跨日期样式
  spanContentStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '12px',
    color: '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 10,
    fontWeight: '500'
  },
  
  // 默认范围样式
  defaultColor: '#667eea',
  defaultBgColor: '#f0f2ff',
  
  // 预定义的项目阶段颜色
  phaseColors: {
    planning: { color: '#6c5ce7', bgColor: '#f4f3ff' },
    design: { color: '#667eea', bgColor: '#f0f2ff' },
    development: { color: '#00b894', bgColor: '#f0fff4' },
    testing: { color: '#f39c12', bgColor: '#fffbf0' },
    deployment: { color: '#e17055', bgColor: '#fff5f5' },
    maintenance: { color: '#636e72', bgColor: '#f8f9fa' }
  }
};

/**
 * 日程安排预设
 * 适用于会议安排、活动规划等场景
 */
const SchedulePreset = {
  // 基础配置
  showContent: true,
  contentSpanMode: 'single', // 日程通常按单日显示
  contentAlignment: 'center',
  maxContentLines: 2,
  
  // 样式配置
  contentDefaultColor: '#2d3436',
  contentDefaultBgColor: '#ffffff',
  contentDefaultFontSize: '11px',
  contentDefaultPadding: '3px 6px',
  contentDefaultBorderRadius: '4px',
  
  // 默认范围样式
  defaultColor: '#0984e3',
  defaultBgColor: '#e3f2fd',
  
  // 预定义的日程类型颜色
  scheduleColors: {
    meeting: { color: '#0984e3', bgColor: '#e3f2fd' },
    event: { color: '#00b894', bgColor: '#e8f5e8' },
    deadline: { color: '#d63031', bgColor: '#ffebee' },
    reminder: { color: '#f39c12', bgColor: '#fff8e1' },
    holiday: { color: '#6c5ce7', bgColor: '#f3e5f5' },
    personal: { color: '#636e72', bgColor: '#f5f6fa' }
  }
};

/**
 * 节假日标记预设
 * 适用于节假日标记、特殊日期提醒等场景
 */
const HolidayPreset = {
  // 基础配置
  showContent: true,
  contentSpanMode: 'single',
  contentAlignment: 'center',
  maxContentLines: 1,
  markAs: 'festival', // 使用节假日标记类型
  
  // 样式配置
  contentDefaultColor: '#ffffff',
  contentDefaultBgColor: '#e74c3c',
  contentDefaultFontSize: '10px',
  contentDefaultPadding: '2px 4px',
  contentDefaultBorderRadius: '3px',
  
  // 默认范围样式
  defaultColor: '#ffffff',
  defaultBgColor: '#e74c3c',
  
  // 预定义的节假日类型颜色
  holidayColors: {
    national: { color: '#ffffff', bgColor: '#e74c3c' },
    traditional: { color: '#ffffff', bgColor: '#f39c12' },
    international: { color: '#ffffff', bgColor: '#9b59b6' },
    workday: { color: '#ffffff', bgColor: '#34495e' },
    weekend: { color: '#ffffff', bgColor: '#95a5a6' },
    vacation: { color: '#ffffff', bgColor: '#3498db' }
  }
};

/**
 * 获取预设配置的辅助函数
 */
function getPreset(presetName) {
  const presets = {
    'project': ProjectManagementPreset,
    'schedule': SchedulePreset,
    'holiday': HolidayPreset
  };
  
  return presets[presetName] || ProjectManagementPreset;
}

/**
 * 合并预设和自定义配置
 */
function mergePresetWithOptions(preset, customOptions = {}) {
  return {
    ...preset,
    ...customOptions,
    // 深度合并样式对象
    spanContentStyle: {
      ...preset.spanContentStyle,
      ...(customOptions.spanContentStyle || {})
    }
  };
}

// 导出
module.exports = {
  ProjectManagementPreset,
  SchedulePreset,
  HolidayPreset,
  getPreset,
  mergePresetWithOptions
};

// 浏览器环境兼容
if (typeof window !== 'undefined') {
  window.DateRangePresets = {
    ProjectManagementPreset,
    SchedulePreset,
    HolidayPreset,
    getPreset,
    mergePresetWithOptions
  };
}