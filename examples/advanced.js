/**
 * 高级使用示例
 * 演示 wx-calendar 日期范围插件的高级功能和复杂场景
 */

const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { DateRangePlugin, DATE_RANGE_PLUGIN_KEY } = require('@code066/wc-plugin-daterange');

// 使用插件 - 方式二：动态管理
WxCalendar.use(DateRangePlugin, {
  markAs: 'festival',
  defaultColor: '#333',
  defaultBgColor: '#f0f0f0',
  onRangeClick: (range, date) => {
    // 全局范围点击处理 - 用于导航
    console.log('全局导航处理:', range.code, date);
    
    // 根据范围类型进行不同的导航处理
    const { data } = range;
    if (data && data.navigateTo) {
      wx.navigateTo({
        url: `${data.navigateTo}?code=${range.code}&date=${date}`
      });
    }
  }
});

Page({
  data: {
    selectedRange: null,
    rangeDetails: {},
    projectList: [],
    currentMonth: new Date().getMonth() + 1
  },

  onLoad() {
    this.initializeRanges();
  },

  handleCalendarLoad() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    console.log('插件信息:', plugin.getInfo());
    
    // 监听范围点击事件
    calendar.on('rangeClick', (event) => {
      const { range, date, code, data } = event;
      
      console.log('范围点击事件:', {
        code,
        date,
        rangeName: range.name,
        data
      });
      
      this.setData({
        selectedRange: {
          code,
          date,
          name: range.name,
          data
        }
      });
      
      // 加载详细数据
      this.loadRangeDetails(code, date);
    });
    
    // 动态添加一些范围
    this.addDynamicRanges(plugin);
  },
  
  initializeRanges() {
    // 初始化项目列表
    this.setData({
      projectList: [
        { id: 'PA001', name: '项目A', status: 'development' },
        { id: 'PB001', name: '项目B', status: 'testing' },
        { id: 'PC001', name: '项目C', status: 'planning' }
      ]
    });
  },
  
  addDynamicRanges(plugin) {
    // 动态添加出差范围
    plugin.addRange({
      name: '出差北京',
      code: 'business_trip_beijing',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      color: '#4ecdc4',
      bgColor: '#e0f7f5',
      data: { 
        destination: '北京',
        purpose: '客户拜访',
        cost: 5000
      }
    });
    
    // 动态添加培训范围
    plugin.addRange({
      name: '技术培训',
      code: 'tech_training_april',
      startDate: '2024-04-10',
      endDate: '2024-04-12',
      color: '#ff6b6b',
      bgColor: '#ffe0e0',
      data: { 
        type: 'training',
        topic: 'React Advanced',
        instructor: 'John Doe'
      }
    });
  },
  
  async loadRangeDetails(code, date) {
    try {
      let details = null;
      
      switch(code) {
        case 'project_a_dev':
        case 'project_b_test':
          details = await this.getProjectDetails(code, date);
          break;
        case 'business_trip_beijing':
          details = await this.getTripDetails(code, date);
          break;
        case 'tech_training_april':
          details = await this.getTrainingDetails(code, date);
          break;
        case 'system_maintenance':
          details = await this.getMaintenanceDetails(code, date);
          break;
        default:
          console.log('未知的范围代码:', code);
          return;
      }
      
      if (details) {
        this.setData({
          [`rangeDetails.${code}`]: details
        });
        
        // 显示详情弹窗
        this.showRangeDetails(code, details);
      }
    } catch (error) {
      console.error('加载范围详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },
  
  async getProjectDetails(code, date) {
    // 模拟 API 调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          projectName: code === 'project_a_dev' ? '项目A' : '项目B',
          phase: code === 'project_a_dev' ? '开发阶段' : '测试阶段',
          progress: code === 'project_a_dev' ? '65%' : '80%',
          team: code === 'project_a_dev' ? 'Frontend Team' : 'QA Team',
          tasks: [
            { name: '任务1', status: 'completed' },
            { name: '任务2', status: 'in-progress' },
            { name: '任务3', status: 'pending' }
          ],
          date: date
        });
      }, 500);
    });
  },
  
  async getTripDetails(code, date) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          destination: '北京',
          purpose: '客户拜访',
          hotel: '北京国际酒店',
          flight: 'CA1234',
          budget: 5000,
          contacts: ['张三', '李四'],
          date: date
        });
      }, 300);
    });
  },
  
  async getTrainingDetails(code, date) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          topic: 'React Advanced',
          instructor: 'John Doe',
          location: '会议室A',
          duration: '3天',
          participants: 15,
          materials: ['PPT', '代码示例', '练习题'],
          date: date
        });
      }, 400);
    });
  },
  
  async getMaintenanceDetails(code, date) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: '系统维护',
          level: '重要',
          duration: '3天',
          affectedSystems: ['用户系统', '支付系统'],
          responsible: '运维团队',
          backup: '已完成',
          date: date
        });
      }, 200);
    });
  },
  
  showRangeDetails(code, details) {
    wx.showModal({
      title: '范围详情',
      content: `代码: ${code}\n详情: ${JSON.stringify(details, null, 2)}`,
      showCancel: false
    });
  },
  
  // 范围管理方法
  addNewRange() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    const newRange = {
      name: '新项目',
      code: `new_project_${Date.now()}`,
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      color: '#ff6b6b',
      bgColor: '#ffe0e0',
      data: { 
        projectId: 'PN001',
        priority: 'medium',
        budget: 10000
      }
    };
    
    plugin.addRange(newRange);
    
    wx.showToast({
      title: '范围已添加',
      icon: 'success'
    });
  },
  
  removeSelectedRange() {
    if (!this.data.selectedRange) {
      wx.showToast({
        title: '请先选择范围',
        icon: 'none'
      });
      return;
    }
    
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    const success = plugin.removeRange(this.data.selectedRange.code);
    
    if (success) {
      this.setData({ selectedRange: null });
      wx.showToast({
        title: '范围已删除',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  },
  
  updateSelectedRange() {
    if (!this.data.selectedRange) {
      wx.showToast({
        title: '请先选择范围',
        icon: 'none'
      });
      return;
    }
    
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    try {
      plugin.updateRange(this.data.selectedRange.code, {
        name: '更新的范围名称',
        color: '#9c88ff',
        bgColor: '#f0edff',
        data: { 
          ...this.data.selectedRange.data,
          updated: true,
          updateTime: new Date().toISOString()
        }
      });
      
      wx.showToast({
        title: '范围已更新',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    }
  },
  
  clearAllRanges() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有范围吗？',
      success: (res) => {
        if (res.confirm) {
          const calendar = this.selectComponent('#calendar');
          const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
          
          plugin.clearRanges();
          this.setData({ 
            selectedRange: null,
            rangeDetails: {}
          });
          
          wx.showToast({
            title: '已清空所有范围',
            icon: 'success'
          });
        }
      }
    });
  },
  
  refreshRanges() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    plugin.refresh();
    
    wx.showToast({
      title: '已刷新',
      icon: 'success'
    });
  },
  
  showPluginInfo() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    const info = plugin.getInfo();
    
    wx.showModal({
      title: '插件信息',
      content: `名称: ${info.name}\n版本: ${info.version}\n范围数量: ${info.rangeCount}\n总日期数: ${info.totalDates}`,
      showCancel: false
    });
  }
});