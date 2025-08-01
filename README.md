# wc-plugin-daterange

微信小程序日历日期范围插件，参考 [wc-plugin-ics](https://github.com/lspriv/wc-plugin-ics) 设计模式，专为 TaroJS 微信小程序开发优化。

## 特性

- 📅 日期范围选择和显示
- 🎨 自定义样式和颜色  
- 📱 支持跨日期连续显示（甘特图效果）
- ⚡ 高性能批量操作和 TaroJS 优化
- 🔧 灵活的配置选项和预设支持
- 📦 TypeScript 支持
- 🚀 专为微信小程序优化的生命周期管理

## 安装

```bash
npm install @code066/wc-plugin-daterange
```

## 快速开始

### 基础用法

```javascript
import WxCalendar from 'wx-calendar';
import { DateRangePlugin } from '@code066/wc-plugin-daterange';

// 创建日历实例
const calendar = new WxCalendar({
  container: '#calendar'
});

// 使用插件（参考 wc-plugin-ics 的使用方式）
calendar.use(DateRangePlugin, {
  enableTaroOptimization: true,
  showContent: true,
  contentSpanMode: 'span'
});

// 获取插件实例
const dateRangePlugin = calendar.getPlugin('dateRange');

// 批量加载数据（类似 ICS 插件的 load 方法）
const ranges = [
  {
    code: 'project-001',
    name: '项目开发',
    startDate: '2024-01-15',
    endDate: '2024-01-30',
    content: '移动端项目开发周期',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  }
];

dateRangePlugin.load(ranges);
```

### 使用预设配置

```javascript
import { DateRangePlugin, ProjectManagementPreset, SchedulePreset } from '@code066/wc-plugin-daterange';

// 项目管理预设
const projectRange = {
  code: 'project-001',
  name: '移动端重构',
  startDate: '2024-01-15',
  endDate: '2024-02-28',
  ...ProjectManagementPreset,
  priority: 'high'
};

// 日程安排预设
const scheduleRange = {
  code: 'meeting-001',
  name: '团队会议',
  startDate: '2024-01-22',
  endDate: '2024-01-22',
  ...SchedulePreset,
  type: 'meeting'
};

dateRangePlugin.load([projectRange, scheduleRange]);
```

### TaroJS 集成示例

```javascript
import Taro from '@tarojs/taro';
import { Component } from 'react';
import WxCalendar from 'wx-calendar';
import { DateRangePlugin, ProjectManagementPreset } from '@code066/wc-plugin-daterange';

export default class CalendarPage extends Component {
  componentDidMount() {
    this.initCalendar();
  }

  initCalendar() {
    const calendar = new WxCalendar({
      container: '#calendar-container',
      enableTaroOptimization: true
    });

    // 使用插件
    calendar.use(DateRangePlugin, {
      enableTaroOptimization: true,
      batchUpdateDelay: 100,
      showContent: true,
      contentSpanMode: 'span',
      onRangeClick: this.handleRangeClick.bind(this)
    });

    this.dateRangePlugin = calendar.getPlugin('dateRange');
    this.loadData();
  }

  async loadData() {
    const ranges = [
      {
        code: 'project-001',
        name: '移动端重构项目',
        startDate: '2024-01-15',
        endDate: '2024-02-28',
        content: '移动端架构重构，预计6周完成',
        ...ProjectManagementPreset,
        priority: 'high',
        status: 'in-progress'
      }
    ];

    await this.dateRangePlugin.load(ranges);
  }

  handleRangeClick(event) {
    const { range, date } = event;
    Taro.showModal({
      title: range.name,
      content: `日期: ${date}\\n内容: ${range.content || '无'}`
    });
  }
}
```

## API 参考

### 插件方法

#### load(ranges)
批量加载日期范围数据（类似 ICS 插件的 load 方法）

```javascript
const loadedCount = await dateRangePlugin.load([
  {
    code: 'range-001',
    name: '项目开发',
    startDate: '2024-01-15',
    endDate: '2024-01-30',
    content: '项目开发周期'
  }
]);
```

#### add(range)
添加单个日期范围

```javascript
dateRangePlugin.add({
  code: 'new-range',
  name: '新任务',
  startDate: '2024-02-01',
  endDate: '2024-02-05'
});
```

#### remove(code)
删除指定的日期范围

```javascript
dateRangePlugin.remove('range-001');
```

#### update(code, updates)
更新指定的日期范围

```javascript
dateRangePlugin.update('range-001', {
  name: '更新的项目名称',
  endDate: '2024-02-15'
});
```

#### clear()
清空所有日期范围

```javascript
dateRangePlugin.clear();
```

#### getInfo()
获取插件信息和统计数据

```javascript
const info = dateRangePlugin.getInfo();
console.log(info.ranges.length); // 范围数量
```

### 配置选项

```typescript
interface DateRangeOptions {
  // TaroJS 优化
  enableTaroOptimization?: boolean;  // 启用 TaroJS 优化
  batchUpdateDelay?: number;         // 批量更新延迟（毫秒）
  maxRangesPerBatch?: number;        // 每批最大范围数量
  
  // 显示配置
  showContent?: boolean;             // 显示内容文本
  contentSpanMode?: 'tooltip' | 'span'; // 内容显示模式
  
  // 样式配置
  defaultColor?: string;             // 默认文字颜色
  defaultBgColor?: string;           // 默认背景颜色
  
  // 事件回调
  onRangeClick?: (event) => void;    // 范围点击事件
  onDateClick?: (event) => void;     // 日期点击事件
  onRangeAdd?: (range) => void;      // 范围添加事件
  onRangeRemove?: (code, range) => void; // 范围删除事件
}
```

### 数据格式

```typescript
interface DateRange {
  code: string;                      // 唯一标识符
  name: string;                      // 显示名称
  startDate: string;                 // 开始日期 (YYYY-MM-DD)
  endDate: string;                   // 结束日期 (YYYY-MM-DD)
  content?: string;                  // 内容描述
  color?: string;                    // 文字颜色
  bgColor?: string;                  // 背景颜色
  priority?: 'high' | 'medium' | 'low'; // 优先级
  status?: 'pending' | 'in-progress' | 'completed'; // 状态
  data?: any;                        // 附加数据
}
```

## 预设配置

### ProjectManagementPreset
项目管理预设，适用于项目开发、任务管理等场景

```javascript
import { ProjectManagementPreset } from '@code066/wc-plugin-daterange';

const projectRange = {
  code: 'project-001',
  name: '移动端重构',
  startDate: '2024-01-15',
  endDate: '2024-02-28',
  ...ProjectManagementPreset,
  priority: 'high'
};
```

### SchedulePreset
日程安排预设，适用于会议、培训等日程管理

```javascript
import { SchedulePreset } from '@code066/wc-plugin-daterange';

const meetingRange = {
  code: 'meeting-001',
  name: '团队会议',
  startDate: '2024-01-22',
  endDate: '2024-01-22',
  ...SchedulePreset,
  type: 'meeting'
};
```

### HolidayPreset
假期预设，适用于节假日、休假等场景

```javascript
import { HolidayPreset } from '@code066/wc-plugin-daterange';

const holidayRange = {
  code: 'holiday-001',
  name: '春节假期',
  startDate: '2024-02-10',
  endDate: '2024-02-17',
  ...HolidayPreset
};
```

## 高级特性

### 跨日期连续显示
支持甘特图效果的跨日期连续显示

```javascript
calendar.use(DateRangePlugin, {
  contentSpanMode: 'span',  // 启用跨日期显示
  showContent: true
});
```

### 批量操作优化
针对大量数据的批量操作优化

```javascript
// 批量加载大量数据
const ranges = generateLargeDataSet(); // 假设有1000+条数据
await dateRangePlugin.load(ranges); // 自动分批处理
```

### TaroJS 生命周期优化
自动适配 TaroJS 页面生命周期

```javascript
// 插件会自动监听页面 onHide/onShow 事件
// 在页面隐藏时暂停更新，显示时恢复更新
calendar.use(DateRangePlugin, {
  enableTaroOptimization: true
});
```

## 性能优化

### 批量更新
```javascript
// 设置批量更新延迟，避免频繁重绘
calendar.use(DateRangePlugin, {
  batchUpdateDelay: 100,      // 100ms 延迟
  maxRangesPerBatch: 50       // 每批最多50个范围
});
```

### 资源清理
```javascript
// 组件销毁时自动清理资源
componentWillUnmount() {
  if (this.dateRangePlugin) {
    this.dateRangePlugin.destroy();
  }
}
```

## 事件处理

### 范围点击事件
```javascript
calendar.use(DateRangePlugin, {
  onRangeClick: (event) => {
    const { range, date } = event;
    console.log(`点击了范围 ${range.name} 的 ${date} 日期`);
  }
});
```

### 日期点击事件
```javascript
calendar.use(DateRangePlugin, {
  onDateClick: (event) => {
    const { date, ranges } = event;
    console.log(`点击了 ${date}，包含 ${ranges.length} 个范围`);
  }
});
```

## 样式自定义

### 基础样式
```css
.date-range-mark {
  border-radius: 8rpx;
  transition: all 0.3s ease;
}

.date-range-mark.range-start {
  border-top-left-radius: 50%;
  border-bottom-left-radius: 50%;
}

.date-range-mark.range-end {
  border-top-right-radius: 50%;
  border-bottom-right-radius: 50%;
}
```

### 优先级指示器
```css
.date-range-mark.priority-high::after {
  content: '';
  position: absolute;
  top: 2rpx;
  right: 2rpx;
  width: 8rpx;
  height: 8rpx;
  background: #f44336;
  border-radius: 50%;
}
```

## 常见问题

### Q: 如何处理大量数据？
A: 使用 `load` 方法批量加载，插件会自动分批处理以保证性能。

### Q: 如何自定义样式？
A: 可以通过 CSS 覆盖默认样式，或使用预设配置快速应用主题。

### Q: 如何在 TaroJS 中优化性能？
A: 启用 `enableTaroOptimization` 选项，插件会自动适配页面生命周期。

### Q: 支持哪些日期格式？
A: 目前支持 YYYY-MM-DD 格式，如 '2024-01-15'。

## 更新日志

### v2.0.0
- 🎉 重构插件架构，参考 wc-plugin-ics 设计模式
- ⚡ 新增 TaroJS 优化支持
- 📦 新增预设配置支持
- 🚀 性能优化和批量操作支持
- 📱 改进微信小程序兼容性

### v1.x.x
- 基础日期范围功能
- 自定义样式支持
- 事件处理机制

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关项目

- [wx-calendar](https://github.com/lspriv/wx-calendar) - 微信小程序日历组件
- [wc-plugin-ics](https://github.com/lspriv/wc-plugin-ics) - ICS 日历订阅插件
- [TaroJS](https://taro.aotu.io/) - 多端统一开发框架