// 排序可视化独立模块
window.SortVisualizer = {
  init: function(options = {}) {
    const { 
      canvas = null, 
      speed = 300,
      isAuto = true,
      sortedCount = null 
    } = options;
    
    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;
    
    let arr = [64, 34, 25, 12, 22, 11, 90, 45, 78, 33];
    let sortedIdx = [];
    let comparing = [-1, -1];
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let sortedCountRef = sortedCount;
    
    // 冒泡排序步骤生成器
    function* bubbleSortSteps(arr) {
      let arrCopy = [...arr];
      const n = arrCopy.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          comparing = [j, j + 1];
          yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
          if (arrCopy[j] > arrCopy[j + 1]) {
            [arrCopy[j], arrCopy[j + 1]] = [arrCopy[j + 1], arrCopy[j]];
            comparing = [j, j + 1];
            yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
          }
        }
        sortedIdx.push(n - 1 - i);
        comparing = [-1, -1];
        yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
      }
      sortedIdx.push(0);
      comparing = [-1, -1];
      yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
    }
    
    // 选择排序步骤生成器
    function* selectionSortSteps(arr) {
      let arrCopy = [...arr];
      const n = arrCopy.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        comparing = [i, minIdx];
        yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
        
        for (let j = i + 1; j < n; j++) {
          comparing = [minIdx, j];
          yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
          if (arrCopy[j] < arrCopy[minIdx]) {
            minIdx = j;
            comparing = [i, minIdx];
            yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
          }
        }
        
        if (minIdx !== i) {
          [arrCopy[i], arrCopy[minIdx]] = [arrCopy[minIdx], arrCopy[i]];
        }
        sortedIdx.push(i);
        comparing = [-1, -1];
        yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
      }
      sortedIdx.push(n - 1);
      comparing = [-1, -1];
      yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
    }
    
    // 插入排序步骤生成器
    function* insertionSortSteps(arr) {
      let arrCopy = [...arr];
      const n = arrCopy.length;
      for (let i = 1; i < n; i++) {
        let key = arrCopy[i];
        let j = i - 1;
        comparing = [j, i];
        yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
        
        while (j >= 0 && arrCopy[j] > key) {
          arrCopy[j + 1] = arrCopy[j];
          comparing = [j, j + 1];
          yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
          j--;
        }
        arrCopy[j + 1] = key;
        
        sortedIdx = [...Array(i + 1).keys()];
        comparing = [-1, -1];
        yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
      }
    }
    
    // 希尔排序步骤生成器
    function* shellSortSteps(arr) {
      let arrCopy = [...arr];
      const n = arrCopy.length;
      let gap = Math.floor(n / 2);
      
      while (gap > 0) {
        for (let i = gap; i < n; i++) {
          let temp = arrCopy[i];
          let j = i;
          comparing = [j - gap, j];
          yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
          
          while (j >= gap && arrCopy[j - gap] > temp) {
            arrCopy[j] = arrCopy[j - gap];
            comparing = [j - gap, j];
            yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
            j -= gap;
          }
          arrCopy[j] = temp;
          comparing = [-1, -1];
          yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
        }
        gap = Math.floor(gap / 2);
      }
      
      sortedIdx = [...Array(n).keys()];
      comparing = [-1, -1];
      yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
    }
    
    // 快速排序步骤生成器
    function* quickSortSteps(arr, low, high) {
      if (low < high) {
        let pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          comparing = [j, high];
          yield { arr: [...arr], comparing: [...comparing], sorted: [...sortedIdx] };
          
          if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            comparing = [i, j];
            yield { arr: [...arr], comparing: [...comparing], sorted: [...sortedIdx] };
          }
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        const pi = i + 1;
        
        sortedIdx.push(pi);
        comparing = [-1, -1];
        yield { arr: [...arr], comparing: [...comparing], sorted: [...sortedIdx] };
        
        yield* quickSortSteps(arr, low, pi - 1);
        yield* quickSortSteps(arr, pi + 1, high);
      }
    }
    
    // 归并排序步骤生成器
    function* mergeSortSteps(arr, left, right) {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        yield* mergeSortSteps(arr, left, mid);
        yield* mergeSortSteps(arr, mid + 1, right);
        
        yield* merge(arr, left, mid, right);
      }
    }
    
    function* merge(arr, left, mid, right) {
      const n1 = mid - left + 1;
      const n2 = right - mid;
      const L = [];
      const R = [];
      
      for (let i = 0; i < n1; i++) L[i] = arr[left + i];
      for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];
      
      let i = 0, j = 0, k = left;
      
      while (i < n1 && j < n2) {
        comparing = [left + i, mid + 1 + j];
        yield { arr: [...arr], comparing: [...comparing], sorted: [...sortedIdx] };
        
        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }
        k++;
      }
      
      while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
      }
      
      while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
      }
      
      for (let idx = left; idx <= right; idx++) {
        if (!sortedIdx.includes(idx)) sortedIdx.push(idx);
      }
      comparing = [-1, -1];
      yield { arr: [...arr], comparing: [...comparing], sorted: [...sortedIdx] };
    }
    
    // 堆排序步骤生成器
    function* heapSortSteps(arr) {
      let arrCopy = [...arr];
      const n = arrCopy.length;
      
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield* heapifySteps(arrCopy, n, i);
      }
      
      for (let i = n - 1; i > 0; i--) {
        [arrCopy[0], arrCopy[i]] = [arrCopy[i], arrCopy[0]];
        sortedIdx.push(i);
        
        comparing = [-1, -1];
        yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
        
        yield* heapifySteps(arrCopy, i, 0);
      }
      sortedIdx.push(0);
      comparing = [-1, -1];
      yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
    }
    
    function* heapifySteps(arr, n, i) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      
      if (l < n && arr[l] > arr[largest]) largest = l;
      if (r < n && arr[r] > arr[largest]) largest = r;
      
      comparing = [i, largest];
      yield { arr: [...arr], comparing: [...comparing], sorted: [...sortedIdx] };
      
      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        comparing = [i, largest];
        yield { arr: [...arr], comparing: [...comparing], sorted: [...sortedIdx] };
        
        yield* heapifySteps(arr, n, largest);
      }
    }
    
    // 基数排序步骤生成器
    function* radixSortSteps(arr) {
      let arrCopy = [...arr];
      const maxNum = Math.max(...arrCopy);
      
      for (let exp = 1; Math.floor(maxNum / exp) > 0; exp *= 10) {
        yield* countSortSteps(arrCopy, exp);
      }
      
      sortedIdx = [...Array(arrCopy.length).keys()];
      comparing = [-1, -1];
      yield { arr: [...arrCopy], comparing: [...comparing], sorted: [...sortedIdx] };
    }
    
    function* countSortSteps(arr, exp) {
      const n = arr.length;
      const output = new Array(n).fill(0);
      const count = new Array(10).fill(0);
      
      for (let i = 0; i < n; i++) {
        count[Math.floor(arr[i] / exp) % 10]++;
      }
      
      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }
      
      for (let i = n - 1; i >= 0; i--) {
        const idx = Math.floor(arr[i] / exp) % 10;
        output[count[idx] - 1] = arr[i];
        count[idx]--;
      }
      
      for (let i = 0; i < n; i++) {
        arr[i] = output[i];
      }
    }
    
    const drawArray = () => {
      if (!ctx || !canvasEl) return;
      
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      
      const barWidth = (canvasEl.width - 40) / arr.length;
      const maxVal = Math.max(...arr);
      const padding = 20;
      
      for (let i = 0; i < arr.length; i++) {
        const barHeight = (arr[i] / maxVal) * (canvasEl.height - 60);
        const x = padding + i * barWidth + 5;
        const y = canvasEl.height - padding - barHeight;
        
        let color = '#3b82f6';
        if (sortedIdx.includes(i)) {
          color = '#22c55e';
        } else if (comparing[0] === i) {
          color = '#f59e0b';
        } else if (comparing[1] === i) {
          color = '#ef4444';
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(arr[i].toString(), x + (barWidth - 10) / 2, y + barHeight / 2);
      }
    };
    
    const shuffleArr = () => {
      resetAll();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      drawArray();
    };
    
    const resetAll = () => {
      arr = [64, 34, 25, 12, 22, 11, 90, 45, 78, 33];
      sortedIdx = [];
      comparing = [-1, -1];
      runFlag = false;
      stepQueue = [];
      if (sortedCountRef && typeof sortedCountRef === 'object' && 'value' in sortedCountRef) {
        sortedCountRef.value = 0;
      }
      drawArray();
    };
    
    const startRun = async (algorithm = 'bubble_sort') => {
      if (runFlag) return;
      
      resetAll();
      runFlag = true;
      
      const stepsMap = {
        'bubble_sort': bubbleSortSteps,
        'selection_sort': selectionSortSteps,
        'insertion_sort': insertionSortSteps,
        'shell_sort': shellSortSteps,
        'quick_sort': () => quickSortSteps([...arr], 0, arr.length - 1),
        'merge_sort': () => mergeSortSteps(arr, 0, arr.length - 1),
        'heap_sort': heapSortSteps,
        'radix_sort': radixSortSteps
      };
      
      const stepGenerator = stepsMap[algorithm] ? stepsMap[algorithm]([...arr]) : bubbleSortSteps([...arr]);
      
      for (let step of stepGenerator) {
        if (!runFlag) break;
        
        arr = step.arr;
        comparing = step.comparing;
        sortedIdx = step.sorted;
        if (sortedCountRef && typeof sortedCountRef === 'object' && 'value' in sortedCountRef) {
          sortedCountRef.value = sortedIdx.length;
        }
        drawArray();
        
        if (currentIsAuto) {
          await new Promise(resolve => setTimeout(resolve, currentSpeed));
        } else {
          stepQueue.push(step);
          runFlag = false;
          break;
        }
      }
      
      if (currentIsAuto) {
        runFlag = false;
      }
    };
    
    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        arr = step.arr;
        comparing = step.comparing;
        sortedIdx = step.sorted;
        if (sortedCountRef && typeof sortedCountRef === 'object' && 'value' in sortedCountRef) {
          sortedCountRef.value = sortedIdx.length;
        }
        drawArray();
      }
    };
    
    const setSpeed = (newSpeed) => {
      currentSpeed = newSpeed;
    };
    
    const setAuto = (auto) => {
      currentIsAuto = auto;
    };
    
    // 初始化
    drawArray();
    
    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto
    };
  }
};
