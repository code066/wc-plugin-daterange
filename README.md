# @code066/wc-plugin-daterange

小程序日历组件 wx-calendar 日期范围标记插件，支持在日历上显示带名称的日期范围，并提供点击交互功能。

## 特性

- 📅 **日期范围标记** - 在日历上标记指定的日期范围
- 🎨 **自定义样式** - 支持自定义颜色和背景色
- 🔄 **多范围支持** - 同时显示多个不同的日期范围
- 🖱️ **点击交互** - 支持范围点击事件，提供 code 标识
- 🔧 **动态管理** - 运行时添加、删除、更新范围
- 📱 **小程序兼容** - 完全兼容微信小程序环境
- 🎯 **TypeScript 支持** - 提供完整的类型定义

## 使用要求

- 小程序基础库 SDKVersion >= 3.0.0
- 日历组件 wx-calendar >= 1.6.0

## 安装

```bash
npm i @code066/wc-plugin-daterange -S
```

## 构建

微信小程序开发工具菜单栏：**工具** --> **构建 npm**

## 基本使用

### 方式一：插件初始化时配置

```javascript
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { DateRangePlugin } = require('@code066/wc-plugin-daterange');

// 使用插件
WxCalendar.use(DateRangePlugin, {
  ranges: [
    {
      name: '春节假期',
      code: 'spring_festival_2024',
      startDate: '2024-02-10',
      endDate: '2024-02-17',
      color: '#ff4757',
      bgColor: '#ffe0e0',
      data: { type: 'holiday' }
    },
    {
      name: '项目开发',
      code: 'project_dev_phase1',
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      color: '#3742fa',
      bgColor: '#e0e5ff',
      data: { projectId: 'P001' }
    }
  ],
  markAs: 'festival',
  onRangeClick: (range, date) => {
    console.log('点击了范围:', range.code, '日期:', date);
    // 根据 code 调用其他组件
    loadDataByCode(range.code, date);
  }
});

Page({
  // 页面逻辑
})
```

### 方式二：动态管理范围

```javascript
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { DateRangePlugin, DATE_RANGE_PLUGIN_KEY } = require('@code066/wc-plugin-daterange');

WxCalendar.use(DateRangePlugin);

Page({
  handleCalendarLoad() {
    const calendar = this.selectComponent('#calendar');
    const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);
    
    // 动态添加范围
    plugin.addRange({
      name: '出差',
      code: 'business_trip_april',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      color: '#4ecdc4',
      bgColor: '#e0f7f5',
      data: { destination: '北京' }
    });
    
    // 监听范围点击事件
    calendar.on('rangeClick', (event) => {
      const { range, date, code, data } = event;
      console.log('范围代码:', code);
      this.loadDataByCode(code, date);
    });
  },
  
  loadDataByCode(code, date) {
    switch(code) {
      case 'spring_festival_2024':
        this.loadHolidayData(date);
        break;
      case 'project_dev_phase1':
        this.loadProjectData(date);
        break;
      case 'business_trip_april':
        this.loadTripData(date);
        break;
    }
  }
});
```

## API 文档

### DateRange 接口

```typescript
interface DateRange {
  name: string;        // 显示的名字
  code: string;        // 范围代码，用于数据调用
  startDate: string;   // 开始日期 YYYY-MM-DD
  endDate: string;     // 结束日期 YYYY-MM-DD
  color?: string;      // 文字颜色
  bgColor?: string;    // 背景颜色
  clickable?: boolean; // 是否可点击，默认 true
  data?: any;          // 附加数据
}
```

### PluginOptions 配置

```typescript
interface PluginOptions {
  ranges: DateRange[];                    // 日期范围数组
  markAs?: 'schedule' | 'corner' | 'festival'; // 标记类型
  defaultColor?: string;                  // 默认文字颜色
  defaultBgColor?: string;               // 默认背景颜色
  onRangeClick?: (range: DateRange, date: string) => void; // 范围点击回调
}
```

### 插件方法

```javascript
const plugin = calendar.getPlugin(DATE_RANGE_PLUGIN_KEY);

// 添加范围
plugin.addRange({
  name: '新范围',
  code: 'new_range_001',
  startDate: '2024-04-01',
  endDate: '2024-04-05'
});

// 删除范围
plugin.removeRange('new_range_001');

// 更新范围
plugin.updateRange('new_range_001', {
  name: '更新的范围',
  endDate: '2024-04-10'
});

// 获取范围
const range = plugin.getRangeByCode('new_range_001');
const rangesOnDate = plugin.getRangesByDate('2024-04-01');
const allRanges = plugin.getRanges();

// 清空所有范围
plugin.clearRanges();

// 刷新显示
plugin.refresh();
```

### 事件系统

#### 1. 全局回调

```javascript
WxCalendar.use(DateRangePlugin, {
  onRangeClick: (range, date) => {
    // 全局范围点击处理
    console.log('全局点击:', range.code, date);
  }
});
```

#### 2. 自定义事件

```javascript
calendar.on('rangeClick', (event) => {
  const { range, date, code, data } = event;
  // 处理范围点击事件
});
```

## 高级配置

### 多类型范围管理

```javascript
const ranges = [
  {
    name: '项目A',
    code: 'project_a_phase1',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    color: '#3742fa',
    bgColor: '#e0e5ff',
    data: { 
      projectId: 'PA001',
      phase: 'development',
      team: 'frontend'
    }
  },
  {
    name: '维护期',
    code: 'maintenance_march',
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    color: '#ffa726',
    bgColor: '#fff3e0',
    clickable: false, // 不可点击
    data: { type: 'maintenance' }
  }
];
```

### 动态数据加载

```javascript
Page({
  loadRangeDetails(code, date) {
    switch(code) {
      case 'project_a_phase1':
        return this.getProjectDetails(code, date);
      case 'maintenance_march':
        return this.getMaintenanceDetails(code, date);
      default:
        return Promise.resolve(null);
    }
  },
  
  async getProjectDetails(code, date) {
    const res = await wx.request({
      url: '/api/project/details',
      data: { code, date }
    });
    return res.data;
  }
});
```

## 注意事项

⚠️ **重要**：一定要将相关域名配置到小程序后台合法域名（如果需要请求外部数据）

操作：小程序后台 -> 开发 -> 开发设置 -> 服务器域名

## 兼容性

- 支持 wx-calendar v1.6.0+
- 兼容微信小程序环境
- 支持 TypeScript
- 支持 CommonJS 和 ES6 模块

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持日期范围标记
- 支持点击交互
- 支持动态管理
- 提供 TypeScript 类型定义