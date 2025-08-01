/**
 * 跨周内容显示示例
 * 演示如何使用 wc-plugin-daterange 插件实现内容跨多周显示
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

// 示例数据：跨周项目任务
const crossWeekRanges = [
  {
    code: 'long-project',
    name: '长期项目',
    startDate: '2025-08-01', // 周五
    endDate: '2025-08-15',   // 下下周五，跨越3周
    color: '#fff',
    bgColor: '#4a90e2',
    content: '这是一个跨越多周的长期项目任务，需要在每一行都显示',
    data: { phase: 'development', priority: 'high' }
  },
  {
    code: 'cross-week-task',
    name: '跨周任务',
    startDate: '2025-08-06', // 周三
    endDate: '2025-08-12',   // 下周二，跨越2周
    color: '#fff',
    bgColor: '#7b68ee',
    contents: [
      { text: '第一阶段：需求分析', style: { color: '#4b0082' } },
      { text: '第二阶段：设计开发', style: { color: '#6a5acd' } },
      { text: '第三阶段：测试部署', style: { color: '#8a2be2' } }
    ],
    data: { phase: 'multi-stage', assignee: 'team-alpha' }
  },
  {
    code: 'month-long-task',
    name: '月度任务',
    startDate: '2025-08-05', // 周二
    endDate: '2025-08-25',   // 跨越3周多
    color: '#fff',
    bgColor: '#32cd32',
    content: {
      text: '月度持续性任务，横跨整个月份的多个周',
      style: {
        backgroundColor: '#98fb98',
        color: '#006400',
        border: '1px solid #32cd32'
      }
    },
    data: { phase: 'continuous', duration: 'monthly' }
  },
  {
    code: 'weekend-span',
    name: '周末跨越',
    startDate: '2025-08-08', // 周五
    endDate: '2025-08-11',   // 下周一，跨越周末
    color: '#fff',
    bgColor: '#ff6347',
    contents: [
      '周五开始准备',
      { text: '周末持续进行', style: { backgroundColor: '#ffa07a' } },
      { text: '周一完成收尾', style: { backgroundColor: '#ff7f50' } }
    ],
    data: { phase: 'weekend-work', special: true }
  }
];

// 添加范围数据
plugin.addRanges(crossWeekRanges);

// 生成标记数据
const marks = plugin.generateMarks();

console.log('生成的跨周标记数据:', marks);

// 分析跨周内容标记
const spanContentMarks = marks.filter(mark => mark.markType === 'span-content');
console.log('\n=== 跨周内容标记分析 ===');
console.log(`总共生成了 ${spanContentMarks.length} 个跨周内容标记`);

// 按任务分组显示
const marksByRange = {};
spanContentMarks.forEach(mark => {
  if (!marksByRange[mark.rangeCode]) {
    marksByRange[mark.rangeCode] = [];
  }
  marksByRange[mark.rangeCode].push(mark);
});

Object.keys(marksByRange).forEach(rangeCode => {
  const rangeMark = marksByRange[rangeCode];
  console.log(`\n任务 ${rangeCode}:`);
  console.log(`  跨越 ${rangeMark[0].spanInfo.totalWeeks} 周`);
  console.log(`  生成 ${rangeMark.length} 个内容标记`);
  
  rangeMark.forEach(mark => {
    console.log(`    周 ${mark.spanInfo.currentWeek}: ${mark.date} - "${mark.text}"`);
    console.log(`      是否第一周: ${mark.weekGroup.isFirstWeek}`);
    console.log(`      是否最后一周: ${mark.weekGroup.isLastWeek}`);
    console.log(`      该周天数: ${mark.weekGroup.days}`);
  });
});

// 演示功能
console.log('\n=== 跨周显示功能演示 ===');

// 1. 获取特定周的内容
function getContentForWeek(weekStartDate) {
  const weekMarks = spanContentMarks.filter(mark => 
    mark.weekGroup.dates.includes(weekStartDate)
  );
  
  console.log(`\n${weekStartDate} 所在周的跨周内容:`);
  weekMarks.forEach(mark => {
    console.log(`  ${mark.rangeCode}: ${mark.text}`);
    console.log(`    周信息: 第${mark.spanInfo.currentWeek}周/共${mark.spanInfo.totalWeeks}周`);
  });
  
  return weekMarks;
}

// 2. 分析跨周模式的优势
function analyzeSpanMode() {
  console.log('\n跨周模式分析:');
  
  const multiWeekTasks = spanContentMarks.filter(mark => mark.spanInfo.isMultiWeek);
  const singleWeekTasks = spanContentMarks.filter(mark => !mark.spanInfo.isMultiWeek);
  
  console.log(`  多周任务标记: ${multiWeekTasks.length} 个`);
  console.log(`  单周任务标记: ${singleWeekTasks.length} 个`);
  
  // 统计每个任务的周分布
  const taskWeekDistribution = {};
  multiWeekTasks.forEach(mark => {
    if (!taskWeekDistribution[mark.rangeCode]) {
      taskWeekDistribution[mark.rangeCode] = new Set();
    }
    taskWeekDistribution[mark.rangeCode].add(mark.spanInfo.currentWeek);
  });
  
  console.log('\n  任务周分布:');
  Object.keys(taskWeekDistribution).forEach(taskCode => {
    const weeks = Array.from(taskWeekDistribution[taskCode]).sort();
    console.log(`    ${taskCode}: 跨越第 ${weeks.join(', ')} 周`);
  });
}

// 3. 切换到单日模式对比
function compareWithSingleMode() {
  console.log('\n=== 单日模式对比 ===');
  
  // 临时切换到单日模式
  plugin.updateOptions({ contentSpanMode: 'single' });
  const singleModeMarks = plugin.generateMarks();
  const singleContentMarks = singleModeMarks.filter(mark => mark.markType === 'content');
  
  console.log(`单日模式生成 ${singleContentMarks.length} 个内容标记`);
  console.log(`跨周模式生成 ${spanContentMarks.length} 个内容标记`);
  
  // 切换回跨周模式
  plugin.updateOptions({ contentSpanMode: 'span' });
  
  return {
    singleMode: singleContentMarks.length,
    spanMode: spanContentMarks.length,
    efficiency: `跨周模式减少了 ${((singleContentMarks.length - spanContentMarks.length) / singleContentMarks.length * 100).toFixed(1)}% 的标记数量`
  };
}

// 4. 动态添加跨月任务
function addCrossMonthTask() {
  const crossMonthTask = {
    code: 'cross-month-project',
    name: '跨月项目',
    startDate: '2025-08-25',
    endDate: '2025-09-05',
    color: '#fff',
    bgColor: '#9370db',
    contents: [
      '8月底启动阶段',
      { text: '9月初实施阶段', style: { backgroundColor: '#dda0dd' } },
      { text: '跨月协调工作', style: { backgroundColor: '#ba55d3' } }
    ],
    data: { phase: 'cross-month', critical: true }
  };
  
  plugin.addRange(crossMonthTask);
  console.log('\n已添加跨月任务:', crossMonthTask.name);
  
  const newMarks = plugin.generateMarks();
  const newSpanMarks = newMarks.filter(mark => 
    mark.markType === 'span-content' && mark.rangeCode === 'cross-month-project'
  );
  
  console.log(`跨月任务生成了 ${newSpanMarks.length} 个跨周内容标记`);
  return newSpanMarks;
}

// 执行演示
console.log('\n1. 获取特定周的内容:');
getContentForWeek('2025-08-04');
getContentForWeek('2025-08-11');

console.log('\n2. 分析跨周模式:');
analyzeSpanMode();

console.log('\n3. 模式对比:');
const comparison = compareWithSingleMode();
console.log(comparison.efficiency);

console.log('\n4. 添加跨月任务:');
const crossMonthMarks = addCrossMonthTask();

// 导出供其他模块使用
export {
  plugin,
  crossWeekRanges,
  getContentForWeek,
  analyzeSpanMode,
  compareWithSingleMode,
  addCrossMonthTask
};