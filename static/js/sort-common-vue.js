import { useCommonVue } from '../js/common-vue.js';

export function useSortCommonVue() {
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
    { name: '快速排序', href: './quick_sort.html' },
    { name: '归并排序', href: './merge_sort.html' }
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

  return {
    sidebarHidden,
    showSearch,
    searchQuery,
    showBackTop,
    navItems,
    activeNav,
    toggleSidebar,
    toggleSearch,
    scrollToTop,
    setActiveNav
  };
}