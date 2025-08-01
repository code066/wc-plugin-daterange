/**
 * 基础使用示例
 * 演示 wx-calendar 日期范围插件的基本功能
 */

const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { DateRangePlugin, DATE_RANGE_PLUGIN_KEY } = require('@code066/wc-plugin-daterange');

// 使用插件 - 方式一：初始化时配置
WxCalendar.use(DateRangePlugin, {
  ranges: [
    {
      name: '春节假期',
      code: 'spring_festival_2024',
      startDate: '2024-02-10',
      endDate: '2024-02-17',
      color: '#ff4757',
      bgColor: '#ffe0e0',
      clickable: true,
      data: { type: 'holiday', description: '春节长假' }
    },
    {
      name: '项目开发',
      code: 'project_dev_phase1',
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      color: '#3742fa',
      bgColor: '#e0e5ff',
      clickable: true,
      data: { projectId: 'P001', phase: 'development' }
    },
    {
      name: '系统维护',
      code: 'system_maintenance',
      startDate: '2024-03-20',
      endDate: '2024-03-22',
      color: '#ffa726',
      bgColor: '#fff3e0',
      clickable: false, // 不可点击
      data: { type: 'maintenance' }
    }
  ],
  markAs: 'festival', // 标记类型
  onRangeClick: (range, date) => {
    // 全局范围点击处理
    console.log('全局点击处理:', range.code, date);
    wx.showToast({
      title: `点击了 ${range.name}`,
      icon: 'none'
    });
  }
});

Page({
  data: {
    selectedInfo: null
  },

  onLoad() {
    console.log('页面加载');
  },

  // 日历组件加载完成
  handleCalendarLoad() {
    console.log('日历加载完成');
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    // 监听范围点击事件
    calendar.on('rangeClick', (event) => {
      const { range, date, code, data } = event;
      console.log('范围点击事件:', { code, date, data });
      
      // 更新页面数据
      this.setData({
        selectedInfo: {
          rangeName: range.name,
          rangeCode: code,
          clickDate: date,
          rangeData: data
        }
      });
      
      // 根据 code 加载相关数据
      this.loadDataByCode(code, date);
    });
    
    // 演示动态添加范围
    setTimeout(() => {
      plugin.addRange({
        name: '培训课程',
        code: 'training_course_001',
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        color: '#4ecdc4',
        bgColor: '#e0f7f5',
        data: { courseId: 'C001', instructor: '张老师' }
      });
      
      console.log('动态添加了培训课程范围');
    }, 2000);
  },

  // 根据范围代码加载数据
  loadDataByCode(code, date) {
    switch(code) {
      case 'spring_festival_2024':
        this.loadHolidayData(date);
        break;
      case 'project_dev_phase1':
        this.loadProjectData(date);
        break;
      case 'training_course_001':
        this.loadTrainingData(date);
        break;
      default:
        console.log('未知的范围代码:', code);
    }
  },

  // 加载假期数据
  loadHolidayData(date) {
    console.log('加载假期数据:', date);
    wx.showModal({
      title: '春节假期',
      content: `${date} 是春节假期，好好休息！`,
      showCancel: false
    });
  },

  // 加载项目数据
  loadProjectData(date) {
    console.log('加载项目数据:', date);
    wx.showModal({
      title: '项目开发',
      content: `${date} 项目开发进度：前端开发阶段`,
      showCancel: false
    });
  },

  // 加载培训数据
  loadTrainingData(date) {
    console.log('加载培训数据:', date);
    wx.showModal({
      title: '培训课程',
      content: `${date} 培训课程：JavaScript 高级编程`,
      showCancel: false
    });
  },

  // 演示插件方法
  handleAddRange() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    plugin.addRange({
      name: '临时会议',
      code: 'temp_meeting_' + Date.now(),
      startDate: '2024-04-10',
      endDate: '2024-04-10',
      color: '#e74c3c',
      bgColor: '#ffeaea',
      data: { type: 'meeting', urgent: true }
    });
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  handleRemoveRange() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    plugin.removeRange('training_course_001');
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  handleGetRanges() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    const ranges = plugin.getRanges();
    console.log('当前所有范围:', ranges);
    
    wx.showModal({
      title: '范围列表',
      content: `共有 ${ranges.length} 个范围`,
      showCancel: false
    });
  },

  handleClearRanges() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有范围吗？',
      success: (res) => {
        if (res.confirm) {
          plugin.clearRanges();
          this.setData({ selectedInfo: null });
          wx.showToast({
            title: '清空成功',
            icon: 'success'
          });
        }
      }
    });
  }
});

// 辅助函数
function loadHolidayData(range, date) {
  console.log('全局假期数据加载:', range.code, date);
  // 可以在这里实现全局的假期数据加载逻辑
}

function loadProjectData(range, date) {
  console.log('全局项目数据加载:', range.code, date);
  // 可以在这里实现全局的项目数据加载逻辑
}