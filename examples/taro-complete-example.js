// Taro.js 项目中使用 wc-plugin-daterange 的完整示例
// 适用于微信小程序项目

import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { DateRangePlugin, DATE_RANGE_PLUGIN_KEY } from '@code066/wc-plugin-daterange'
import WxCalendar from 'wx-calendar'

export default class TaroCalendarExample extends Component {
  config = {
    navigationBarTitleText: 'Taro 日历示例'
  }

  state = {
    showContent: true,
    loading: false,
    ranges: []
  }

  componentDidMount() {
    this.initCalendar()
    this.loadDemoData()
  }

  componentWillUnmount() {
    // 清理资源
    if (this.calendar) {
      const plugin = this.calendar.getPlugin(DATE_RANGE_PLUGIN_KEY)
      if (plugin) {
        plugin.destroy()
      }
      this.calendar.destroy()
    }
  }

  initCalendar = () => {
    const calendar = new WxCalendar({
      container: '#calendar-container',
      // 其他日历配置...
    })

    calendar.use(DateRangePlugin, {
      ranges: [],
      showContent: this.state.showContent,
      contentMarkAs: 'schedule',
      contentDefaultColor: '#666666',
      contentDefaultBgColor: '#f8f9fa',
      contentDefaultFontSize: '12px',
      contentDefaultPadding: '4px 8px',
      contentDefaultBorderRadius: '4px',
      maxContentLines: 3,
      
      onRangeClick: this.handleRangeClick
    })

    this.calendar = calendar
  }

  loadDemoData = () => {
    const demoRanges = [
      {
        name: '需求分析',
        code: 'requirement_analysis',
        startDate: '2024-03-01',
        endDate: '2024-03-07',
        contents: [
          { text: '📋 需求收集', color: '#00b894' },
          { text: '📊 需求分析', color: '#fdcb6e' },
          { text: '✅ 需求确认', color: '#00b894' }
        ],
        color: '#6c5ce7',
        bgColor: '#f4f3ff'
      },
      {
        name: '系统设计',
        code: 'system_design',
        startDate: '2024-03-08',
        endDate: '2024-03-15',
        content: '架构设计\nUI/UX 设计\n数据库设计',
        color: '#667eea',
        bgColor: '#f0f2ff'
      },
      {
        name: '开发阶段',
        code: 'development',
        startDate: '2024-03-16',
        endDate: '2024-04-15',
        contents: [
          { text: '🔧 后端开发', color: '#00b894' },
          { text: '🎨 前端开发', color: '#fdcb6e' },
          { text: '📱 移动端开发', color: '#e17055' }
        ],
        color: '#00b894',
        bgColor: '#f0fff4'
      },
      {
        name: '测试阶段',
        code: 'testing',
        startDate: '2024-04-16',
        endDate: '2024-04-25',
        content: {
          text: '🧪 功能测试\n⚡ 性能测试\n🔒 安全测试',
          color: '#d63031',
          bgColor: '#fff5f5',
          style: {
            fontSize: '11px',
            padding: '6px',
            borderRadius: '6px'
          }
        },
        color: '#f39c12',
        bgColor: '#fffbf0'
      }
    ]

    this.setState({ ranges: demoRanges })
    
    const plugin = this.calendar.getPlugin(DATE_RANGE_PLUGIN_KEY)
    if (plugin) {
      demoRanges.forEach(range => {
        plugin.addRange(range)
      })
    }
  }

  handleRangeClick = (event) => {
    const { rangeName, rangeCode, rangeData, markType, contentText } = event
    
    if (markType === 'content') {
      // 点击的是内容标记
      Taro.showModal({
        title: '内容详情',
        content: contentText || '暂无详细信息',
        showCancel: false
      })
    } else {
      // 点击的是范围标记
      Taro.showActionSheet({
        itemList: ['查看详情', '编辑', '删除'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.viewRangeDetail(rangeCode, rangeData)
              break
            case 1:
              this.editRange(rangeCode)
              break
            case 2:
              this.deleteRange(rangeCode, rangeName)
              break
          }
        }
      })
    }
  }

  viewRangeDetail = (rangeCode, rangeData) => {
    const detailText = `项目阶段：${rangeData.name}\n开始时间：${rangeData.startDate}\n结束时间：${rangeData.endDate}`
    
    Taro.showModal({
      title: '阶段详情',
      content: detailText,
      showCancel: false
    })
  }

  editRange = (rangeCode) => {
    // 这里可以导航到编辑页面
    Taro.showToast({
      title: `编辑 ${rangeCode}`,
      icon: 'none'
    })
  }

  deleteRange = (rangeCode, rangeName) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${rangeName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const plugin = this.calendar.getPlugin(DATE_RANGE_PLUGIN_KEY)
          if (plugin) {
            plugin.removeRange(rangeCode)
            
            // 更新状态
            const newRanges = this.state.ranges.filter(r => r.code !== rangeCode)
            this.setState({ ranges: newRanges })
            
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      }
    })
  }

  toggleContentDisplay = () => {
    const newShowContent = !this.state.showContent
    this.setState({ showContent: newShowContent })
    
    const plugin = this.calendar.getPlugin(DATE_RANGE_PLUGIN_KEY)
    if (plugin) {
      plugin.options.showContent = newShowContent
      plugin.refresh()
    }
    
    Taro.showToast({
      title: newShowContent ? '已显示内容' : '已隐藏内容',
      icon: 'none'
    })
  }

  addNewRange = () => {
    const newRange = {
      name: '紧急维护',
      code: `emergency_${Date.now()}`,
      startDate: '2024-04-26',
      endDate: '2024-04-26',
      contents: [
        { text: '🚨 系统维护', color: '#d63031' },
        { text: '⏰ 预计2小时', color: '#636e72' }
      ],
      color: '#e74c3c',
      bgColor: '#ffebee'
    }

    const plugin = this.calendar.getPlugin(DATE_RANGE_PLUGIN_KEY)
    if (plugin) {
      plugin.addRange(newRange)
      
      const newRanges = [...this.state.ranges, newRange]
      this.setState({ ranges: newRanges })
      
      Taro.showToast({
        title: '添加成功',
        icon: 'success'
      })
    }
  }

  updateRangeProgress = () => {
    const plugin = this.calendar.getPlugin(DATE_RANGE_PLUGIN_KEY)
    if (plugin) {
      plugin.updateRange('development', {
        content: '🔧 后端开发 ✅\n🎨 前端开发 🔄\n📱 移动端开发 ⏳\n\n进度：75%'
      })
      
      Taro.showToast({
        title: '进度已更新',
        icon: 'success'
      })
    }
  }

  clearAllRanges = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有范围吗？',
      success: (res) => {
        if (res.confirm) {
          const plugin = this.calendar.getPlugin(DATE_RANGE_PLUGIN_KEY)
          if (plugin) {
            plugin.clearRanges()
            this.setState({ ranges: [] })
            
            Taro.showToast({
              title: '已清空',
              icon: 'success'
            })
          }
        }
      }
    })
  }

  render() {
    const { showContent, ranges } = this.state

    return (
      <View className='taro-calendar-example'>
        {/* 工具栏 */}
        <View className='toolbar'>
          <View className='toolbar-row'>
            <Button 
              size='mini' 
              type='primary' 
              onClick={this.addNewRange}
            >
              添加维护
            </Button>
            <Button 
              size='mini' 
              onClick={this.toggleContentDisplay}
            >
              {showContent ? '隐藏内容' : '显示内容'}
            </Button>
          </View>
          
          <View className='toolbar-row'>
            <Button 
              size='mini' 
              onClick={this.updateRangeProgress}
            >
              更新进度
            </Button>
            <Button 
              size='mini' 
              onClick={this.clearAllRanges}
            >
              清空所有
            </Button>
          </View>
        </View>

        {/* 状态信息 */}
        <View className='status-bar'>
          <Text className='status-text'>
            当前范围数量：{ranges.length} | 
            内容显示：{showContent ? '开启' : '关闭'}
          </Text>
        </View>

        {/* 日历容器 */}
        <View className='calendar-wrapper'>
          <View id='calendar-container'></View>
        </View>

        {/* 说明信息 */}
        <View className='info-panel'>
          <Text className='info-title'>使用说明：</Text>
          <Text className='info-item'>• 点击日期范围查看操作菜单</Text>
          <Text className='info-item'>• 点击内容项查看详细信息</Text>
          <Text className='info-item'>• 使用工具栏按钮进行各种操作</Text>
          <Text className='info-item'>• 支持动态添加、删除、更新范围</Text>
        </View>
      </View>
    )
  }
}

// 样式可以在对应的 .scss 文件中定义
/*
.taro-calendar-example {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .toolbar {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .toolbar-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .status-bar {
    margin-bottom: 15px;
    padding: 10px 15px;
    background: #e3f2fd;
    border-radius: 6px;
    border-left: 4px solid #2196f3;

    .status-text {
      font-size: 14px;
      color: #1976d2;
    }
  }

  .calendar-wrapper {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .info-panel {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .info-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      display: block;
    }

    .info-item {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 5px;
      display: block;
    }
  }
}
*/