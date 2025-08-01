/**
 * wx-calendar 日期范围插件入口文件
 * 参考 wc-plugin-ics 的设计模式，优化 TaroJS 微信小程序集成
 */

const { DateRangePlugin, DATE_RANGE_PLUGIN_KEY } = require('./plugin');
const { ProjectManagementPreset, SchedulePreset, HolidayPreset } = require('./presets');

// 主要导出
module.exports = {
  DateRangePlugin,
  DATE_RANGE_PLUGIN_KEY,
  
  // 预设配置
  ProjectManagementPreset,
  SchedulePreset,
  HolidayPreset,
  
  // 兼容性导出
  default: DateRangePlugin
};

// ES6 模块兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports.DateRangePlugin = DateRangePlugin;
  module.exports.DATE_RANGE_PLUGIN_KEY = DATE_RANGE_PLUGIN_KEY;
  module.exports.ProjectManagementPreset = ProjectManagementPreset;
  module.exports.SchedulePreset = SchedulePreset;
  module.exports.HolidayPreset = HolidayPreset;
}