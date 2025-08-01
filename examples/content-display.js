/**
 * 内容显示示例
 * 演示如何在日期下面显示数据内容，支持自定义背景色、文字颜色
 */

const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { DateRangePlugin, DATE_RANGE_PLUGIN_KEY } = require('@code066/wc-plugin-daterange');

// 使用插件，启用内容显示功能
WxCalendar.use(DateRangePlugin, {
  ranges: [
    {
      name: '项目开发',
      code: 'project_dev_2024',
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      color: '#3742fa',
      bgColor: '#e0e5ff',
      // 单个内容项 - 字符串形式
      content: '前端开发阶段\n进度：65%',
      data: { projectId: 'P001', phase: 'development' }
    },
    {
      name: '系统测试',
      code: 'system_test_2024',
      startDate: '2024-03-16',
      endDate: '2024-03-25',
      color: '#ff6b6b',
      bgColor: '#ffe0e0',
      // 单个内容项 - 对象形式，自定义样式
      content: {
        text: '测试阶段\n发现 3 个 Bug',
        color: '#d63031',
        bgColor: '#ffeaa7',
        style: {
          fontSize: '11px',
          padding: '6px',
          borderRadius: '6px'
        }
      },
      data: { projectId: 'P001', phase: 'testing' }
    },
    {
      name: '产品发布',
      code: 'product_release_2024',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      color: '#00b894',
      bgColor: '#d1f2eb',
      // 多个内容项
      contents: [
        { text: '✅ 代码审查完成', color: '#00b894' },
        { text: '🔄 部署准备中', color: '#fdcb6e' },
        { text: '📋 文档待更新', color: '#6c5ce7' }
      ],
      data: { projectId: 'P001', phase: 'release' }
    },
    {
      name: '培训计划',
      code: 'training_plan_2024',
      startDate: '2024-04-10',
      endDate: '2024-04-12',
      color: '#a29bfe',
      bgColor: '#f1f0ff',
      // 混合内容类型
      contents: [
        'React 高级开发',
        { 
          text: '讲师：张老师', 
          color: '#636e72',
          bgColor: '#ddd'
        },
        { 
          text: '地点：会议室A', 
          color: '#2d3436',
          style: { fontSize: '10px' }
        }
      ],
      data: { type: 'training', instructor: '张老师' }
    }
  ],
  markAs: 'festival', // 范围标记类型
  showContent: true, // 启用内容显示
  contentMarkAs: 'schedule', // 内容标记类型
  contentDefaultColor: '#666666',
  contentDefaultBgColor: '#f8f9fa',
  contentDefaultFontSize: '12px',
  contentDefaultPadding: '4px 8px',
  contentDefaultBorderRadius: '4px',
  maxContentLines: 3, // 最多显示3行内容
  onRangeClick: (range, date) => {
    console.log('范围点击:', range.code, date);
    wx.showToast({
      title: `点击了 ${range.name}`,
      icon: 'none'
    });
  }
});

Page({
  data: {
    selectedInfo: null,
    contentDetails: {}
  },

  onLoad() {
    console.log('内容显示示例页面加载');
  },

  handleCalendarLoad() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    console.log('插件信息:', plugin.getInfo());
    
    // 监听范围点击事件
    calendar.on('rangeClick', (event) => {
      const { range, date, code, data } = event;
      
      this.setData({
        selectedInfo: {
          rangeName: range.name,
          rangeCode: code,
          clickDate: date,
          rangeData: data
        }
      });
      
      // 根据不同的项目阶段显示不同的详情
      this.showPhaseDetails(code, date, data);
    });
    
    // 演示动态添加带内容的范围
    setTimeout(() => {
      plugin.addRange({
        name: '紧急维护',
        code: 'emergency_maintenance',
        startDate: '2024-04-20',
        endDate: '2024-04-20',
        color: '#e17055',
        bgColor: '#fab1a0',
        contents: [
          { text: '🚨 系统维护', color: '#d63031' },
          { text: '预计2小时', color: '#636e72' }
        ],
        data: { priority: 'high', type: 'maintenance' }
      });
      
      wx.showToast({
        title: '添加紧急维护',
        icon: 'success'
      });
    }, 3000);
  },

  // 显示阶段详情
  showPhaseDetails(code, date, data) {
    let title = '';
    let content = '';
    
    switch(code) {
      case 'project_dev_2024':
        title = '项目开发详情';
        content = `开发进度：65%\n当前任务：前端组件开发\n负责人：开发团队\n预计完成：${date}`;
        break;
      case 'system_test_2024':
        title = '系统测试详情';
        content = `测试进度：80%\n发现问题：3个Bug\n测试类型：功能测试\n负责人：QA团队`;
        break;
      case 'product_release_2024':
        title = '产品发布详情';
        content = `发布版本：v2.0.0\n发布环境：生产环境\n发布时间：${date}\n负责人：运维团队`;
        break;
      case 'training_plan_2024':
        title = '培训计划详情';
        content = `培训主题：React 高级开发\n培训讲师：张老师\n培训地点：会议室A\n参与人数：15人`;
        break;
      default:
        title = '详情信息';
        content = `日期：${date}\n代码：${code}`;
    }
    
    wx.showModal({
      title: title,
      content: content,
      showCancel: false
    });
  },

  // 切换内容显示
  handleToggleContent() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    // 获取当前配置
    const currentShowContent = plugin.options.showContent;
    
    // 更新配置
    plugin.options.showContent = !currentShowContent;
    
    // 刷新显示
    plugin.refresh();
    
    wx.showToast({
      title: currentShowContent ? '隐藏内容' : '显示内容',
      icon: 'success'
    });
  },

  // 更新内容样式
  handleUpdateContentStyle() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    // 更新内容样式配置
    plugin.options.contentDefaultColor = '#2d3436';
    plugin.options.contentDefaultBgColor = '#dfe6e9';
    plugin.options.contentDefaultFontSize = '11px';
    
    // 刷新显示
    plugin.refresh();
    
    wx.showToast({
      title: '样式已更新',
      icon: 'success'
    });
  },

  // 添加动态内容
  handleAddDynamicContent() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    plugin.addRange({
      name: '临时任务',
      code: 'temp_task_' + Date.now(),
      startDate: todayStr,
      endDate: tomorrowStr,
      color: '#fd79a8',
      bgColor: '#ffeaa7',
      contents: [
        { text: '📝 临时任务', color: '#e84393' },
        { text: '优先级：高', color: '#d63031' },
        { text: '截止：明天', color: '#636e72' }
      ],
      data: { 
        priority: 'high', 
        deadline: tomorrowStr,
        assignee: '当前用户'
      }
    });
    
    wx.showToast({
      title: '添加临时任务',
      icon: 'success'
    });
  }
});