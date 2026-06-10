# 算法可视化学习平台

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-brightgreen?style=for-the-badge" alt="Vue">
  <img src="https://img.shields.io/badge/Monaco-Editor-orange?style=for-the-badge" alt="Monaco">
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge" alt="Bootstrap">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</p>

> 一个交互式的算法与数据结构学习平台，通过可视化演示帮助理解各种排序算法、数据结构和经典算法的原理与实现。

---

## 页面预览

### 排序算法演示

![排序算法可视化](./static/showImg/VisualizedEg.png)

> 冒泡排序可视化演示 - 展示排序过程动画、代码高亮和多语言切换

### 主题切换

![主题切换](./static/showImg/themeDemo.png)

> 支持亮色/暗色主题切换，适配不同使用场景

---

## 技术栈

| 技术 | 说明 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | VS Code 同款代码编辑器 |
| [Bootstrap 5.3](https://getbootstrap.com/) | 响应式 CSS 框架 |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 图标库 |
| Canvas API | HTML5 绘图实现可视化动画 |

---

## 项目结构

```
├── sort/                       # 排序算法模块
├── data_structure/             # 数据结构模块
├── search/                     # 搜索算法模块
│   └── backtracking/           #  回溯法子模块
├── dp/                         # 动态规划模块
│   ├── linear/                 #  线性 DP
│   ├── knapsack/               #  背包问题
│   └── bitmask/                #  状压 DP
├── graph_intro/                # 图论入门模块
│   └── sp/                     #  最短路
├── string/                     # 字符串算法模块
├── static/                     # 静态资源文件
│   ├── css/                    #  样式文件
│   ├── js/                     #  JavaScript 模块
│   │   ├── sort/               #   排序可视化
│   │   └── data_structure/     #   数据结构可视化
│   └── vue/                    #  Vue CDN
└── index.html                  # 主入口页面
```

---

## 排序算法 (sort/)

| 算法 | 状态 |
|------|------|
| 冒泡排序 (Bubble Sort) | 已完成 |
| 选择排序 (Selection Sort) | 已完成 |
| 插入排序 (Insertion Sort) | 已完成 |
| 希尔排序 (Shell Sort) | 已完成 |
| 归并排序 (Merge Sort) | 已完成 |
| 快速排序 (Quick Sort) | 已完成 |
| 堆排序 (Heap Sort) | 已完成 |
| 基数排序 (Radix Sort) | 已完成 |

每个排序页面包含：

- 算法原理 - 详细的算法描述
- 复杂度分析 - 时间/空间复杂度表格
- 多语言代码 - C++ / Java / Python 三种实现
- 可视化演示 - Canvas 动画展示排序过程
- 交互控制 - 自动/单步运行、速度调节

---

## 数据结构 (data_structure/)

| 数据结构 | 状态 |
|----------|------|
| 数组 (Array) | 已完成 |
| 链表 (Linked List) | 已完成 |
| 栈 (Stack) | 已完成 |
| 队列 (Queue) | 已完成 |
| 树 (Tree) | 已完成 |
| 二叉树 (Binary Tree) | 已完成 |
| 图 (Graph) | 已完成 |

---

## 搜索算法 (search/)

| 算法 | 状态 |
|------|------|
| 线性搜索 (Linear Search) | 开发中 |
| 二分搜索 (Binary Search) | 开发中 |
| 深度优先搜索 (DFS) | 开发中 |
| 广度优先搜索 (BFS) | 开发中 |
| 哈希表 (Hash Table) | 开发中 |
| 递归 (Recursion) | 开发中 |

### 回溯法 (backtracking/)

| 问题 | 状态 |
|------|------|
| 排列枚举 (Permutation) | 开发中 |
| 子集枚举 (Subset) | 开发中 |
| 组合枚举 (Combination) | 开发中 |

---

## 动态规划 (dp/)

| 问题 | 状态 |
|------|------|
| 最长上升子序列 (LIS) | 开发中 |
| 01背包问题 (0/1 Knapsack) | 开发中 |
| 旅行商问题 (TSP) | 开发中 |
| 记忆化搜索 | 开发中 |

---

## 图论入门 (graph_intro/)

| 内容 | 状态 |
|------|------|
| 图论简介 | 开发中 |
| Dijkstra 最短路 | 开发中 |

---

## 字符串算法 (string/)

| 算法 | 状态 |
|------|------|
| 字符串简介 | 开发中 |
| 字符串哈希 (String Hash) | 开发中 |

---

## 功能特点

| 功能 | 说明 |
|------|------|
| 代码高亮 | Monaco Editor 提供专业级代码编辑体验 |
| 多语言切换 | 支持 C++、Java、Python 一键切换 |
| 代码复制 | 一键复制代码到剪贴板 |
| 可视化动画 | Canvas 绘制实时算法过程 |
| 主题切换 | 亮色/暗色主题自由切换 |
| 响应式设计 | 完美适配桌面和移动设备 |
| 流畅交互 | 自动/单步运行，灵活控制 |

---

## 快速开始

本项目为纯前端静态网站，无需安装任何依赖。

```bash
# 方式一：直接用浏览器打开
open index.html

# 方式二：使用 Python 内置服务器
python -m http.server 8000

# 方式三：使用 npx
npx serve .

# 方式四：使用 VS Code Live Server 插件
# 右键 index.html → "Open with Live Server"
```

访问 `http://localhost:8000` 即可查看。

### 开发说明

- 所有页面采用 **HTML + Vue 3 CDN** 的方式实现
- 样式文件位于 `static/css/` 目录
- 公共模块位于 `static/js/` 目录
- 主题变量通过 **CSS Custom Properties** 定义

---

## 许可证

[MIT License](./LICENSE) - 可以自由使用、修改和分发
