/**
 * wx-calendar 日期范围插件入口文件
 */

const { DateRangePlugin, DATE_RANGE_PLUGIN_KEY } = require('./plugin');

// 导出插件类和常量
module.exports = {
  DateRangePlugin,
  DATE_RANGE_PLUGIN_KEY,
  // 兼容性导出
  default: DateRangePlugin
};

// 如果支持 ES6 模块，也提供 ES6 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports.DateRangePlugin = DateRangePlugin;
  module.exports.DATE_RANGE_PLUGIN_KEY = DATE_RANGE_PLUGIN_KEY;
}