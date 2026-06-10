const { ref, onMounted, onUnmounted } = Vue;

// 配色主题配置
const themeOptionsConfig = [
  {
    id: 'dark',
    name: '黑夜模式',
    colors: ['#0a0e1a', '#ffffff', '#0f1117']
  },
  {
    id: 'light',
    name: '白昼模式',
    colors: ['#ffffff', '#1a1a2e', '#f8fafc']
  },
  {
    id: 'pink-blue',
    name: '粉蓝',
    colors: ['#ff6b9d', '#7dd3fc', '#fff0f5']
  },
  {
    id: 'green-white',
    name: '绿白',
    colors: ['#22c55e', '#ffffff', '#f0fdf4']
  },
  {
    id: 'blue-white',
    name: '蓝白',
    colors: ['#3b82f6', '#ffffff', '#eff6ff']
  }
];

function useCommonVue() {
  const sidebarHidden = ref(false);
  const showBackTop = ref(false);
  const headerTitle = ref('AlgoVisualized');
  const showThemeModal = ref(false);
  const currentTheme = ref('dark');

  const toggleSidebar = () => {
    sidebarHidden.value = !sidebarHidden.value;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleNav = (item) => {
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
  };

  const openThemeModal = () => {
    showThemeModal.value = true;
  };

  const closeThemeModal = () => {
    showThemeModal.value = false;
  };

  const selectTheme = (themeId) => {
    currentTheme.value = themeId;
    if (themeId === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeId);
    }
    const oldTheme = localStorage.getItem('theme');
    localStorage.setItem('theme', themeId);

    const event = new StorageEvent('storage', {
      key: 'theme',
      oldValue: oldTheme,
      newValue: themeId,
      url: window.location.href
    });
    window.dispatchEvent(event);

    closeThemeModal();
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme.value = savedTheme;
    if (savedTheme !== 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  };

  const applyTheme = (themeId) => {
    if (currentTheme.value === themeId) return;
    currentTheme.value = themeId;
    if (themeId === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeId);
    }
  };

  const handleStorageChange = (e) => {
    if (e.key === 'theme' && e.newValue) {
      applyTheme(e.newValue);
    }
  };

  const handleScroll = () => {
    showBackTop.value = window.scrollY > 300;

    const h1Element = document.querySelector('h1');
    if (h1Element) {
      const rect = h1Element.getBoundingClientRect();
      if (rect.top <= 80) {
        const h1Text = h1Element.textContent.trim();
        const mainTitle = h1Text.replace(/部分简介$/, '').replace(/简介$/, '').trim();
        headerTitle.value = mainTitle || h1Text;
      } else {
        headerTitle.value = 'AlgoVisualized';
      }
    }
  };

  const handleResize = () => {
    sidebarHidden.value = true;
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', handleStorageChange);
    handleResize();
    loadTheme();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('storage', handleStorageChange);
  });

  return {
    sidebarHidden,
    showBackTop,
    headerTitle,
    showThemeModal,
    currentTheme,
    toggleSidebar,
    scrollToTop,
    toggleNav,
    openThemeModal,
    closeThemeModal,
    selectTheme
  };
}

const headerItemsConfig = [
  {
    id: 'slider',
    name: '',
    href: '#',
    icon: 'bi-sliders'
  },
  {
    id: 'home',
    name: '',
    href: '../index.html',
    icon: 'bi-stack-overflow'
  },
  {
    id: 'setting',
    name: '设置',
    href: '#',
    icon: 'bi-gear'
  },
  {
    id: 'github',
    name: 'GitHub',
    href: '#',
    icon: 'bi-github'
  }
];

const navItemsConfig = [
  {
    id: 'intro',
    name: '简介',
    href: '../index.html'
  },
  {
    id: 'data_structure',
    name: '数据结构',
    href: '../data_structure/index.html'
  },
  {
    id: 'sort',
    name: '排序',
    href: '../sort/index.html'
  },
  {
    id: 'search',
    name: '搜索',
    href: '../search/index.html'
  },
  {
    id: 'dp',
    name: '动态规划',
    href: '../dp/index.html'
  },
  {
    id: 'string',
    name: '字符串',
    href: '../string/index.html'
  },
  {
    id: 'graph',
    name: '图论',
    href: '../graph_intro/index.html'
  }
];

const sidebarItemsConfig = [
  {
    id: 'intro',
    name: '简介',
    href: '../index.html',
    expanded: false
  },
  {
    id: 'data_structure',
    name: '数据结构',
    children: [
      { id: 'data_structure_intro', name: '数据结构部分简介', href: '../data_structure/index.html' },
      { id: 'array', name: '数组', href: '../data_structure/array.html' },
      { id: 'linked_list', name: '链表', href: '../data_structure/linked_list.html' },
      { id: 'stack', name: '栈', href: '../data_structure/stack.html' },
      { id: 'queue', name: '队列', href: '../data_structure/queue.html' },
      { id: 'graph', name: '图', href: '../data_structure/graph.html' },
      { id: 'tree', name: '树', href: '../data_structure/tree.html' },
      { id: 'binary_tree', name: '二叉树', href: '../data_structure/binary_tree.html' }
    ],
    expanded: false
  },
  {
    id: 'sort',
    name: '排序',
    children: [
      { id: 'sort_intro', name: '排序部分简介', href: '../sort/index.html' },
      { id: 'bubble_sort', name: '冒泡排序', href: '../sort/bubble_sort.html' },
      { id: 'selection_sort', name: '选择排序', href: '../sort/selection_sort.html' },
      { id: 'insertion_sort', name: '插入排序', href: '../sort/insertion_sort.html' },
      { id: 'shell_sort', name: '希尔排序', href: '../sort/shell_sort.html' },
      { id: 'quick_sort', name: '快速排序', href: '../sort/quick_sort.html' },
      { id: 'merge_sort', name: '归并排序', href: '../sort/merge_sort.html' },
      { id: 'heap_sort', name: '堆排序', href: '../sort/heap_sort.html' },
      { id: 'radix_sort', name: '基数排序', href: '../sort/radix_sort.html' }
    ],
    expanded: false
  },
  {
    id: 'search',
    name: '搜索',
    children: [
      { id: 'search_intro', name: '搜索部分简介', href: '../search/index.html' },
      { id: 'linear_search', name: '线性搜索', href: '../search/linear_search.html' },
      { id: 'binary_search', name: '二分搜索', href: '../search/binary_search.html' },
      { id: 'hash_table', name: '哈希表', href: '../search/hash_table.html' },
      { id: 'recursion', name: '递归', href: '../search/recursion.html' },
      {
        id: 'backtracking',
        name: '回溯',
        expanded: false,
        children: [
          { id: 'permutation', name: '全排列', href: '../search/backtracking/permutation.html' },
          { id: 'subset_enumeration', name: '子集枚举', href: '../search/backtracking/subset_enumeration.html' },
          { id: 'combination_enumeration', name: '组合枚举', href: '../search/backtracking/combination_enumeration.html' }
        ]
      },
      { id: 'dfs', name: '深度优先搜索', href: '../search/dfs.html' },
      { id: 'bfs', name: '广度优先搜索', href: '../search/bfs.html' },
    ],
    expanded: false
  },
  {
    id: 'dp',
    name: '动态规划',
    children: [
      { id: 'dp_intro', name: '动态规划部分简介', href: '../dp/index.html' },
      { id: 'memory_search', name: '记忆化搜索', href: '../dp/memory_search.html' },
      {
        id: 'knapsack',
        name: '背包问题',
        expanded: false,
        children: [
          { id: '01_knapsack', name: '01 背包', href: '../dp/knapsack/01_knapsack.html' }
        ]
      },
      {
        id: 'linear_dp',
        name: '线性动态规划',
        expanded: false,
        children: [
          { id: 'lis', name: '最长上升子序列', href: '../dp/linear/lis.html' }
        ]
      },
      {
        id: 'bitmask_dp',
        name: '状态压缩 dp',
        expanded: false,
        children: [
          { id: 'tsp', name: '旅行商问题', href: '../dp/bitmask/TSP.html' }
        ]
      }
    ],
    expanded: false
  },
  {
    id: 'string',
    name: '字符串',
    children: [
      { id: 'string_intro', name: '字符串部分简介', href: '../string/index.html' },
      { id: 'string_hash', name: '字符串哈希', href: '../string/string_hash.html' }
    ],
    expanded: false
  },
  {
    id: 'graph',
    name: '图论',
    expanded: false,
    children: [
      { id: 'graph_intro', name: '图论部分简介', href: '../graph_intro/index.html' },
      {
        id: 'shortest_path',
        name: '最短路',
        expanded: false,
        children: [
          { id: 'dijkstra', name: 'dijkstra 算法', href: '../graph_intro/sp/dijkstra.html' }
        ]
      }
    ]
  }
];

const footerItemsConfig = [
  {
    id: 'copyright',
    text: 'Copyright &copy; <a href="https://github.com/Suzaku-Hyper-Dry" target="_blank"><i class="bi bi-github me-1"></i>GitHub</a>&<a href="https://gitee.com/Suzakuhyperdry">Gitee</a>:SuzakuHyperDry',
    divider: true
  },
  {
    id: 'school',
    text: '内容勘误：suzakuhyperdry@163.com',
    divider: false
  }
];

window.AlgoCommonVue = {
  useCommonVue,
  headerItemsConfig,
  navItemsConfig,
  sidebarItemsConfig,
  footerItemsConfig,
  themeOptionsConfig
};