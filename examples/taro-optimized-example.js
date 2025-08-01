/**
 * TaroJS 微信小程序日期范围插件使用示例
 * 参考 wc-plugin-ics 的设计模式，优化小程序集成
 */

import Taro from '@tarojs/taro';
import { Component } from 'react';
import { View, Text } from '@tarojs/components';
import WxCalendar from 'wx-calendar';
import { DateRangePlugin, ProjectManagementPreset, SchedulePreset } from '@code066/wc-plugin-daterange';

import './index.scss';

export default class DateRangeExample extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedRange: null,
      statistics: {
        totalRanges: 0,
        completedTasks: 0,
        pendingTasks: 0
      }
    };
    
    this.calendar = null;
    this.dateRangePlugin = null;
  }

  componentDidMount() {
    this.initCalendar();
  }

  componentWillUnmount() {
    // 清理资源
    if (this.dateRangePlugin) {
      this.dateRangePlugin.destroy();
    }
  }

  /**
   * 初始化日历和插件
   */
  initCalendar() {
    try {
      // 创建日历实例
      this.calendar = new WxCalendar({
        container: '#calendar-container',
        // TaroJS 优化配置
        enableTaroOptimization: true,
        // 其他日历配置...
      });

      // 使用插件（参考 wc-plugin-ics 的使用方式）
      this.calendar.use(DateRangePlugin, {
        // 启用 TaroJS 优化
        enableTaroOptimization: true,
        batchUpdateDelay: 100,
        maxRangesPerBatch: 50,
        
        // 显示配置
        showContent: true,
        contentSpanMode: 'span', // 跨日期连续显示
        
        // 事件回调
        onRangeClick: this.handleRangeClick.bind(this),
        onDateClick: this.handleDateClick.bind(this),
        onRangeAdd: this.handleRangeAdd.bind(this),
        onRangeRemove: this.handleRangeRemove.bind(this)
      });

      // 获取插件实例
      this.dateRangePlugin = this.calendar.getPlugin('dateRange');

      // 加载示例数据
      this.loadDemoData();

    } catch (error) {
      console.error('Calendar initialization failed:', error);
      Taro.showToast({
        title: '日历初始化失败',
        icon: 'error'
      });
    }
  }

  /**
   * 加载演示数据
   */
  async loadDemoData() {
    try {
      // 使用预设配置
      const projectPreset = ProjectManagementPreset;
      const schedulePreset = SchedulePreset;

      // 项目管理范围
      const projectRanges = [
        {
          code: 'project-001',
          name: '移动端重构项目',
          startDate: '2024-01-15',
          endDate: '2024-02-28',
          content: '移动端架构重构，预计6周完成',
          ...projectPreset,
          priority: 'high',
          status: 'in-progress'
        },
        {
          code: 'project-002',
          name: 'API 接口优化',
          startDate: '2024-02-01',
          endDate: '2024-02-15',
          content: '后端API性能优化',
          ...projectPreset,
          color: '#28a745',
          bgColor: '#d4edda',
          priority: 'medium',
          status: 'pending'
        }
      ];

      // 日程安排范围
      const scheduleRanges = [
        {
          code: 'meeting-001',
          name: '团队周会',
          startDate: '2024-01-22',
          endDate: '2024-01-22',
          content: '每周团队同步会议',
          ...schedulePreset,
          type: 'meeting'
        },
        {
          code: 'training-001',
          name: '技术培训',
          startDate: '2024-01-25',
          endDate: '2024-01-26',
          content: 'React 18 新特性培训',
          ...schedulePreset,
          color: '#17a2b8',
          bgColor: '#d1ecf1',
          type: 'training'
        }
      ];

      // 批量加载范围（使用 load 方法，类似 ICS 插件）
      const allRanges = [...projectRanges, ...scheduleRanges];
      const loadedCount = await this.dateRangePlugin.load(allRanges);
      
      console.log(`Successfully loaded ${loadedCount} ranges`);
      
      // 更新统计信息
      this.updateStatistics();

    } catch (error) {
      console.error('Failed to load demo data:', error);
      Taro.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
    }
  }

  /**
   * 处理范围点击事件
   */
  handleRangeClick(event) {
    const { range, date } = event;
    
    this.setState({ selectedRange: range });
    
    Taro.showModal({
      title: range.name,
      content: `日期: ${date}\n内容: ${range.content || '无'}`,
      showCancel: false
    });
  }

  /**
   * 处理日期点击事件
   */
  handleDateClick(event) {
    const { date, ranges } = event;
    
    if (ranges.length > 0) {
      const rangeNames = ranges.map(r => r.name).join(', ');
      Taro.showToast({
        title: `${date}: ${rangeNames}`,
        icon: 'none',
        duration: 2000
      });
    }
  }

  /**
   * 处理范围添加事件
   */
  handleRangeAdd(range) {
    console.log('Range added:', range);
    this.updateStatistics();
  }

  /**
   * 处理范围删除事件
   */
  handleRangeRemove(code, range) {
    console.log('Range removed:', code, range);
    this.updateStatistics();
  }

  /**
   * 更新统计信息
   */
  updateStatistics() {
    if (!this.dateRangePlugin) return;

    const info = this.dateRangePlugin.getInfo();
    const ranges = info.ranges;
    
    const statistics = {
      totalRanges: ranges.length,
      completedTasks: ranges.filter(r => r.status === 'completed').length,
      pendingTasks: ranges.filter(r => r.status === 'pending' || r.status === 'in-progress').length
    };
    
    this.setState({ statistics });
  }

  /**
   * 添加新任务
   */
  handleAddTask = () => {
    Taro.showModal({
      title: '添加新任务',
      editable: true,
      placeholderText: '请输入任务名称',
      success: (res) => {
        if (res.confirm && res.content) {
          const newRange = {
            code: `task-${Date.now()}`,
            name: res.content,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: '新添加的任务',
            ...ProjectManagementPreset,
            priority: 'medium',
            status: 'pending'
          };
          
          try {
            this.dateRangePlugin.add(newRange);
            Taro.showToast({
              title: '任务添加成功',
              icon: 'success'
            });
          } catch (error) {
            Taro.showToast({
              title: '添加失败',
              icon: 'error'
            });
          }
        }
      }
    });
  }

  /**
   * 清空所有范围
   */
  handleClearAll = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有日程安排吗？',
      success: (res) => {
        if (res.confirm) {
          this.dateRangePlugin.clear();
          this.setState({ selectedRange: null });
          Taro.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  }

  /**
   * 刷新数据
   */
  handleRefresh = () => {
    this.loadDemoData();
    Taro.showToast({
      title: '已刷新',
      icon: 'success'
    });
  }

  render() {
    const { selectedRange, statistics } = this.state;

    return (
      <View className="date-range-example">
        {/* 统计卡片 */}
        <View className="statistics-cards">
          <View className="stat-card">
            <Text className="stat-number">{statistics.totalRanges}</Text>
            <Text className="stat-label">总任务</Text>
          </View>
          <View className="stat-card">
            <Text className="stat-number">{statistics.completedTasks}</Text>
            <Text className="stat-label">已完成</Text>
          </View>
          <View className="stat-card">
            <Text className="stat-number">{statistics.pendingTasks}</Text>
            <Text className="stat-label">进行中</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View className="action-buttons">
          <View className="btn btn-primary" onClick={this.handleAddTask}>
            添加任务
          </View>
          <View className="btn btn-secondary" onClick={this.handleRefresh}>
            刷新
          </View>
          <View className="btn btn-danger" onClick={this.handleClearAll}>
            清空
          </View>
        </View>

        {/* 日历容器 */}
        <View id="calendar-container" className="calendar-container"></View>

        {/* 选中范围详情 */}
        {selectedRange && (
          <View className="selected-range-detail">
            <Text className="detail-title">{selectedRange.name}</Text>
            <Text className="detail-content">{selectedRange.content}</Text>
            <Text className="detail-date">
              {selectedRange.startDate} ~ {selectedRange.endDate}
            </Text>
            {selectedRange.priority && (
              <Text className={`priority priority-${selectedRange.priority}`}>
                {selectedRange.priority.toUpperCase()}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }
}

// 页面配置
DateRangeExample.config = {
  navigationBarTitleText: '日期范围插件示例',
  enablePullDownRefresh: true
};