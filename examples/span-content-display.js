/**
 * 跨日期内容显示示例
 * 演示如何使用 wc-plugin-daterange 插件实现内容跨多个日期显示
 */

import DateRangePlugin from '../src/plugin.js';

// 初始化插件配置
const pluginOptions = {
  // 基础配置
  markAs: 'range',
  defaultColor: '#333',
  defaultBgColor: '#e6f3ff',
  
  // 内容显示配置
  showContent: true,
  contentMarkAs: 'content',
  
  // 跨日期内容配置
  contentSpanMode: 'span', // 'single' | 'span'
  contentAlignment: 'left', // 'left' | 'center' | 'right'
  maxContentLines: 3,
  
  // 跨日期内容样式
  spanContentStyle: {
    backgroundColor: '#f0f8ff',
    border: '1px solid #4a90e2',
    padding: '2px 8px',
    fontSize: '12px',
    color: '#2c5aa0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    zIndex: 10,
    borderRadius: '4px',
    lineHeight: '1.2'
  }
};

// 创建插件实例
const plugin = new DateRangePlugin(pluginOptions);

// 示例数据：项目管理甘特图
const projectRanges = [
  {
    code: 'project-planning',
    name: '项目规划',
    startDate: '2025-08-01',
    endDate: '2025-08-05',
    color: '#fff',
    bgColor: '#4a90e2',
    content: '需求分析、技术选型、团队组建',
    data: { phase: 'planning', priority: 'high' }
  },
  {
    code: 'ui-design',
    name: 'UI设计',
    startDate: '2025-08-04',
    endDate: '2025-08-08',
    color: '#fff',
    bgColor: '#7b68ee',
    contents: [
      { text: '原型设计', style: { color: '#4b0082' } },
      { text: '视觉设计', style: { color: '#6a5acd' } },
      { text: '交互设计', style: { color: '#8a2be2' } }
    ],
    data: { phase: 'design', assignee: 'design-team' }
  },
  {
    code: 'frontend-dev',
    name: '前端开发',
    startDate: '2025-08-07',
    endDate: '2025-08-15',
    color: '#fff',
    bgColor: '#32cd32',
    content: {
      text: '组件开发、页面实现、API对接',
      style: {
        backgroundColor: '#98fb98',
        color: '#006400',
        border: '1px solid #32cd32'
      }
    },
    data: { phase: 'development', team: 'frontend' }
  },
  {
    code: 'backend-dev',
    name: '后端开发',
    startDate: '2025-08-06',
    endDate: '2025-08-18',
    color: '#fff',
    bgColor: '#ff6347',
    contents: [
      '数据库设计',
      { text: 'API开发', style: { backgroundColor: '#ffa07a' } },
      { text: '服务部署', style: { backgroundColor: '#ff7f50' } }
    ],
    data: { phase: 'development', team: 'backend' }
  },
  {
    code: 'testing',
    name: '测试阶段',
    startDate: '2025-08-12',
    endDate: '2025-08-20',
    color: '#fff',
    bgColor: '#ffa500',
    content: '功能测试、性能测试、用户验收测试',
    data: { phase: 'testing', critical: true }
  }
];

// 添加范围数据
plugin.addRanges(projectRanges);

// 生成标记数据
const marks = plugin.generateMarks();

console.log('生成的标记数据:', marks);

// 演示功能
console.log('\n=== 跨日期内容显示演示 ===');

// 1. 切换内容显示模式
function toggleContentSpanMode() {
  const currentMode = plugin.getOptions().contentSpanMode;
  const newMode = currentMode === 'span' ? 'single' : 'span';
  
  plugin.updateOptions({ contentSpanMode: newMode });
  console.log(`内容显示模式已切换为: ${newMode}`);
  
  return plugin.generateMarks();
}

// 2. 更改内容对齐方式
function changeContentAlignment(alignment) {
  plugin.updateOptions({ contentAlignment: alignment });
  console.log(`内容对齐方式已更改为: ${alignment}`);
  
  return plugin.generateMarks();
}

// 3. 更新跨日期内容样式
function updateSpanContentStyle(newStyle) {
  const currentStyle = plugin.getOptions().spanContentStyle;
  const updatedStyle = { ...currentStyle, ...newStyle };
  
  plugin.updateOptions({ spanContentStyle: updatedStyle });
  console.log('跨日期内容样式已更新:', updatedStyle);
  
  return plugin.generateMarks();
}

// 4. 动态添加长期任务
function addLongTermTask() {
  const longTermTask = {
    code: 'maintenance',
    name: '维护期',
    startDate: '2025-08-20',
    endDate: '2025-08-31',
    color: '#fff',
    bgColor: '#9370db',
    contents: [
      '监控系统运行',
      { text: '用户反馈处理', style: { backgroundColor: '#dda0dd' } },
      { text: '性能优化', style: { backgroundColor: '#ba55d3' } }
    ],
    data: { phase: 'maintenance', duration: 'long-term' }
  };
  
  plugin.addRange(longTermTask);
  console.log('已添加长期任务:', longTermTask.name);
  
  return plugin.generateMarks();
}

// 5. 获取特定日期的跨日期内容
function getSpanContentForDate(date) {
  const marks = plugin.generateMarks();
  const spanContentMarks = marks.filter(mark => 
    mark.date === date && mark.markType === 'span-content'
  );
  
  console.log(`${date} 的跨日期内容:`, spanContentMarks);
  return spanContentMarks;
}

// 演示使用
console.log('\n1. 默认跨日期模式的标记:');
console.log(marks.filter(m => m.markType === 'span-content').slice(0, 3));

console.log('\n2. 切换到单日模式:');
const singleModeMarks = toggleContentSpanMode();
console.log(singleModeMarks.filter(m => m.markType === 'content').slice(0, 3));

console.log('\n3. 切换回跨日期模式:');
toggleContentSpanMode();

console.log('\n4. 更改对齐方式为居中:');
changeContentAlignment('center');

console.log('\n5. 更新跨日期内容样式:');
updateSpanContentStyle({
  backgroundColor: '#e6f3ff',
  border: '2px solid #4a90e2',
  fontSize: '14px',
  padding: '4px 12px'
});

console.log('\n6. 添加长期任务:');
addLongTermTask();

console.log('\n7. 获取特定日期的跨日期内容:');
getSpanContentForDate('2025-08-01');

// 导出供其他模块使用
export {
  plugin,
  projectRanges,
  toggleContentSpanMode,
  changeContentAlignment,
  updateSpanContentStyle,
  addLongTermTask,
  getSpanContentForDate
};