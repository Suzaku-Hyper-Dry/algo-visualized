import { useCommonVue } from '../common-vue.js';

export function useSortCommon() {
  const {
    sidebarHidden,
    showSearch,
    searchQuery,
    showBackTop,
    toggleSidebar,
    toggleSearch,
    scrollToTop
  } = useCommonVue();

  const navItems = ref([
    { name: '排序简介', href: './index.html' },
    { name: '冒泡排序', href: './bubble_sort.html' },
    { name: '选择排序', href: './selection_sort.html' },
    { name: '插入排序', href: './insertion_sort.html' },
    { name: '希尔排序', href: './shell_sort.html' },
    { name: '快速排序', href: './quick_sort.html' },
    { name: '归并排序', href: './merge_sort.html' },
    { name: '堆排序', href: './heap_sort.html' },
    { name: '基数排序', href: './radix_sort.html' }
  ]);

  const activeNav = ref('');

  const setActiveNav = () => {
    const currentPath = window.location.pathname;
    activeNav.value = currentPath.split('/').pop();
  };

  const handleScroll = () => {
    showBackTop.value = window.scrollY > 300;
    setActiveNav();
  };

  onMounted(() => {
    setActiveNav();
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  const getSortCode = (sortName) => {
    return window.SortCodeLibrary?.[sortName] || {};
  };

  const sortAlgorithms = [
    { name: 'bubbleSort', title: '冒泡排序', avgComplexity: 'O(n²)', worstComplexity: 'O(n²)', spaceComplexity: 'O(1)', stable: true },
    { name: 'selectionSort', title: '选择排序', avgComplexity: 'O(n²)', worstComplexity: 'O(n²)', spaceComplexity: 'O(1)', stable: false },
    { name: 'insertionSort', title: '插入排序', avgComplexity: 'O(n²)', worstComplexity: 'O(n²)', spaceComplexity: 'O(1)', stable: true },
    { name: 'shellSort', title: '希尔排序', avgComplexity: 'O(n^1.3)', worstComplexity: 'O(n²)', spaceComplexity: 'O(1)', stable: false },
    { name: 'quickSort', title: '快速排序', avgComplexity: 'O(nlogn)', worstComplexity: 'O(n²)', spaceComplexity: 'O(logn)', stable: false },
    { name: 'mergeSort', title: '归并排序', avgComplexity: 'O(nlogn)', worstComplexity: 'O(nlogn)', spaceComplexity: 'O(n)', stable: true },
    { name: 'heapSort', title: '堆排序', avgComplexity: 'O(nlogn)', worstComplexity: 'O(nlogn)', spaceComplexity: 'O(1)', stable: false },
    { name: 'radixSort', title: '基数排序', avgComplexity: 'O(nk)', worstComplexity: 'O(nk)', spaceComplexity: 'O(n+k)', stable: true }
  ];

  return {
    sidebarHidden,
    showSearch,
    searchQuery,
    showBackTop,
    navItems,
    activeNav,
    sortAlgorithms,
    toggleSidebar,
    toggleSearch,
    scrollToTop,
    setActiveNav,
    getSortCode
  };
}
