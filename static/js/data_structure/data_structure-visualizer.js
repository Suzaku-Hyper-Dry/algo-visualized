window.DSVisualizer = {
  init: function(options = {}) {
    const {
      canvas = null,
      speed = 300,
      isAuto = true,
      opType = null
    } = options;

    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const CELL_W = 56;
    const CELL_H = 48;
    const GAP = 6;
    const MAX_CAPACITY = 12;

    const getRandomArray = (length = 8, min = 1, max = 99) => {
      return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    };

    let arr = getRandomArray();
    let cellStates = [];
    let msgText = '';
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let currentOperation = 'access';
    let opTypeRef = opType;

    cellStates = new Array(arr.length).fill('normal');

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    const getColor = (state) => {
      const map = {
        'normal':    { bg: '#3b82f6', text: '#e2e8f0' },
        'accessed':  { bg: '#f59e0b', text: '#1e293b' },
        'inserted':  { bg: '#22c55e', text: '#ffffff' },
        'deleted':   { bg: '#ef4444', text: '#ffffff' },
        'comparing': { bg: '#f59e0b', text: '#1e293b' },
        'shifted':   { bg: '#8b5cf6', text: '#ffffff' },
        'found':     { bg: '#22c55e', text: '#ffffff' },
        'not-found': { bg: '#64748b', text: '#ffffff' }
      };
      return map[state] || map['normal'];
    };

    const drawArray = () => {
      if (!ctx || !canvasEl) return;

      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const n = arr.length;
      const totalW = n * CELL_W + (n - 1) * GAP;
      const startX = (canvasEl.width - totalW) / 2;
      const startY = 60;

      if (msgText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msgText, canvasEl.width / 2, 30);
      }

      for (let i = 0; i < n; i++) {
        const x = startX + i * (CELL_W + GAP);
        const y = startY;
        const state = cellStates[i] || 'normal';
        const color = getColor(state);

        ctx.fillStyle = color.bg;
        roundRect(ctx, x, y, CELL_W, CELL_H, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, CELL_W, CELL_H, 8);
        ctx.stroke();

        ctx.fillStyle = color.text;
        ctx.font = 'bold 15px "JetBrains Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const val = arr[i];
        ctx.fillText(val !== null && val !== undefined ? val.toString() : '', x + CELL_W / 2, y + CELL_H / 2);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.fillText('[' + i + ']', x + CELL_W / 2, y + CELL_H + 18);
      }
    };

    function* accessSteps(arrCopy) {
      const idx = Math.floor(Math.random() * arrCopy.length);
      cellStates = new Array(arrCopy.length).fill('normal');
      cellStates[idx] = 'accessed';
      msgText = `访问 arr[${idx}] = ${arrCopy[idx]}  O(1)`;
      yield { arr: [...arrCopy], cells: [...cellStates] };
    }

    function* insertSteps(arrCopy) {
      if (arrCopy.length >= MAX_CAPACITY) {
        cellStates = new Array(arrCopy.length).fill('normal');
        msgText = '数组已满，无法插入（最大容量 ' + MAX_CAPACITY + '）';
        yield { arr: [...arrCopy], cells: [...cellStates] };
        return;
      }
      const value = Math.floor(Math.random() * 90) + 10;
      const idx = Math.floor(Math.random() * (arrCopy.length + 1));

      arrCopy.push(0);
      cellStates = new Array(arrCopy.length).fill('normal');
      cellStates[idx] = 'accessed';
      msgText = `准备在 arr[${idx}] 处插入 ${value}`;
      yield { arr: [...arrCopy], cells: [...cellStates] };

      for (let i = arrCopy.length - 1; i > idx; i--) {
        arrCopy[i] = arrCopy[i - 1];
        cellStates = new Array(arrCopy.length).fill('normal');
        cellStates[i] = 'shifted';
        msgText = `元素后移 arr[${i - 1}] → arr[${i}]`;
        yield { arr: [...arrCopy], cells: [...cellStates] };
      }

      arrCopy[idx] = value;
      cellStates = new Array(arrCopy.length).fill('normal');
      cellStates[idx] = 'inserted';
      msgText = `插入完成 arr[${idx}] = ${value}`;
      yield { arr: [...arrCopy], cells: [...cellStates] };
    }

    function* deleteSteps(arrCopy) {
      if (arrCopy.length <= 3) {
        cellStates = new Array(arrCopy.length).fill('normal');
        msgText = '数组元素过少，无法删除（最少保留 3 个）';
        yield { arr: [...arrCopy], cells: [...cellStates] };
        return;
      }
      const idx = Math.floor(Math.random() * arrCopy.length);
      const removedVal = arrCopy[idx];

      cellStates = new Array(arrCopy.length).fill('normal');
      cellStates[idx] = 'deleted';
      msgText = `准备删除 arr[${idx}] = ${removedVal}`;
      yield { arr: [...arrCopy], cells: [...cellStates] };

      const ghostArr = [...arrCopy];
      ghostArr[idx] = null;
      cellStates = new Array(arrCopy.length).fill('normal');
      cellStates[idx] = 'deleted';
      msgText = `已移除 arr[${idx}]，开始前移`;
      yield { arr: [...ghostArr], cells: [...cellStates] };

      for (let i = idx; i < arrCopy.length - 1; i++) {
        arrCopy[i] = arrCopy[i + 1];
        cellStates = new Array(arrCopy.length).fill('normal');
        cellStates[i] = 'shifted';
        msgText = `元素前移 arr[${i + 1}] → arr[${i}]`;
        yield { arr: [...arrCopy], cells: [...cellStates] };
      }

      arrCopy.pop();
      cellStates = new Array(arrCopy.length).fill('normal');
      msgText = `删除完成，数组长度 = ${arrCopy.length}`;
      yield { arr: [...arrCopy], cells: [...cellStates] };
    }

    function* searchSteps(arrCopy) {
      const target = Math.floor(Math.random() * 90) + 10;
      let found = false;

      for (let i = 0; i < arrCopy.length; i++) {
        cellStates = new Array(arrCopy.length).fill('normal');
        cellStates[i] = 'comparing';
        msgText = `搜索 ${target}：比较 arr[${i}] = ${arrCopy[i]}`;
        yield { arr: [...arrCopy], cells: [...cellStates] };

        if (arrCopy[i] === target) {
          cellStates = new Array(arrCopy.length).fill('normal');
          cellStates[i] = 'found';
          msgText = `找到！arr[${i}] = ${target}`;
          yield { arr: [...arrCopy], cells: [...cellStates] };
          found = true;
          break;
        }
      }

      if (!found) {
        cellStates = new Array(arrCopy.length).fill('not-found');
        msgText = `未找到目标值 ${target}`;
        yield { arr: [...arrCopy], cells: [...cellStates] };
      }
    }

    const shuffleArr = () => {
      resetAll();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      cellStates = new Array(arr.length).fill('normal');
      msgText = '';
      drawArray();
    };

    const resetAll = () => {
      arr = getRandomArray();
      cellStates = new Array(arr.length).fill('normal');
      msgText = '';
      runFlag = false;
      stepQueue = [];
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = 'access';
      }
      drawArray();

      if (!currentIsAuto) {
        const stepsMap = {
          'access': accessSteps,
          'insert': insertSteps,
          'delete': deleteSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...arr]) : accessSteps([...arr]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      }
    };

    const startRun = async (operation = 'access') => {
      if (runFlag) return;

      currentOperation = operation;
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = operation;
      }
      runFlag = true;

      if (!currentIsAuto) {
        cellStates = new Array(arr.length).fill('normal');
        msgText = '';
        stepQueue = [];
        drawArray();

        const stepsMap = {
          'access': accessSteps,
          'insert': insertSteps,
          'delete': deleteSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...arr]) : accessSteps([...arr]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
        runFlag = false;
        return;
      }

      cellStates = new Array(arr.length).fill('normal');
      msgText = '';
      drawArray();

      const stepsMap = {
        'access': accessSteps,
        'insert': insertSteps,
        'delete': deleteSteps,
        'search': searchSteps
      };
      const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...arr]) : accessSteps([...arr]);

      for (let step of stepGenerator) {
        if (!runFlag) break;

        arr = step.arr.filter(v => v !== null);
        if (step.arr.some(v => v === null)) {
          arr = [...step.arr];
        }
        cellStates = step.cells;
        drawArray();

        await new Promise(resolve => setTimeout(resolve, currentSpeed));
      }

      cellStates = new Array(arr.length).fill('normal');
      drawArray();
      runFlag = false;
    };

    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        arr = step.arr.filter(v => v !== null);
        if (step.arr.some(v => v === null)) {
          arr = [...step.arr];
        }
        cellStates = step.cells;
        drawArray();
      }
    };

    const setSpeed = (newSpeed) => {
      currentSpeed = newSpeed;
    };

    const setAuto = (auto) => {
      currentIsAuto = auto;

      if (!auto) {
        cellStates = new Array(arr.length).fill('normal');
        msgText = '';
        stepQueue = [];
        drawArray();

        const stepsMap = {
          'access': accessSteps,
          'insert': insertSteps,
          'delete': deleteSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...arr]) : accessSteps([...arr]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      } else {
        stepQueue = [];
      }
    };

    const hasNextStep = () => {
      return stepQueue.length > 0;
    };

    drawArray();

    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto,
      hasNextStep
    };
  },

  initLinkedList: function(options = {}) {
    const {
      canvas = null,
      speed = 300,
      isAuto = true,
      opType = null
    } = options;

    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const NODE_W = 70;
    const NODE_H = 46;
    const ARROW_W = 32;

    const getRandomList = (length) => {
      const n = length || Math.floor(Math.random() * 3) + 4;
      return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    };

    let list = getRandomList();
    let nodeStates = [];
    let msgText = '';
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let currentOperation = 'traverse';
    let opTypeRef = opType;

    nodeStates = new Array(list.length).fill('normal');

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    const drawArrow = (fromX, fromY, toX, toY, color) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      const headLen = 8;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX - headLen * Math.cos(angle), toY - headLen * Math.sin(angle));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLen * Math.cos(angle - Math.PI / 6),
        toY - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headLen * Math.cos(angle + Math.PI / 6),
        toY - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    };

    const getColor = (state) => {
      const map = {
        'normal':     { bg: '#3b82f6', text: '#e2e8f0' },
        'traversing': { bg: '#f59e0b', text: '#1e293b' },
        'inserting':  { bg: '#22c55e', text: '#ffffff' },
        'deleting':   { bg: '#ef4444', text: '#ffffff' },
        'found':      { bg: '#22c55e', text: '#ffffff' },
        'not-found':  { bg: '#64748b', text: '#ffffff' }
      };
      return map[state] || map['normal'];
    };

    const drawList = () => {
      if (!ctx || !canvasEl) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      if (msgText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msgText, canvasEl.width / 2, 28);
      }

      const n = list.length;
      if (n === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '15px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HEAD → NULL  (空链表)', canvasEl.width / 2, canvasEl.height / 2);
        return;
      }

      const totalW = n * NODE_W + (n - 1) * ARROW_W;
      const startX = Math.max(60, (canvasEl.width - totalW) / 2);
      const startY = 70;

      const headX = startX - 62;
      const headY = startY + NODE_H / 2;
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HEAD', headX + 20, headY);
      drawArrow(headX + 40, headY, startX, headY, '#8b5cf6');

      for (let i = 0; i < n; i++) {
        const x = startX + i * (NODE_W + ARROW_W);
        const y = startY;
        const state = nodeStates[i] || 'normal';
        const color = getColor(state);

        ctx.fillStyle = color.bg;
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, NODE_W, NODE_H, 10);
        ctx.fill();
        ctx.stroke();

        if (state !== 'normal') {
          ctx.strokeStyle = color.bg;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.5;
          roundRect(ctx, x - 2, y - 2, NODE_W + 4, NODE_H + 4, 12);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + NODE_W - 18, y + 6);
        ctx.lineTo(x + NODE_W - 18, y + NODE_H - 6);
        ctx.stroke();

        ctx.fillStyle = color.text;
        ctx.font = 'bold 14px "JetBrains Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(list[i].toString(), x + (NODE_W - 18) / 2, y + NODE_H / 2);

        const dotX = x + NODE_W - 9;
        const dotY = y + NODE_H / 2;
        ctx.fillStyle = color.text;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.fillText('[' + i + ']', x + NODE_W / 2, y + NODE_H + 18);

        if (i < n - 1) {
          const nextX = x + NODE_W + ARROW_W;
          drawArrow(x + NODE_W + 2, y + NODE_H / 2, nextX - 2, y + NODE_H / 2, '#64748b');
        } else {
          const nullX = x + NODE_W + 14;
          const nullY = y + NODE_H / 2;
          ctx.fillStyle = '#64748b';
          ctx.font = 'italic 12px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('NULL', nullX, nullY);
        }
      }
    };

    function* traverseSteps(listCopy) {
      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = '开始遍历链表';
      yield { list: [...listCopy], states: [...nodeStates] };

      for (let i = 0; i < listCopy.length; i++) {
        nodeStates = new Array(listCopy.length).fill('normal');
        nodeStates[i] = 'traversing';
        msgText = `cur → 节点[${i}] = ${listCopy[i]}`;
        yield { list: [...listCopy], states: [...nodeStates] };
      }

      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = 'cur → NULL，遍历完成';
      yield { list: [...listCopy], states: [...nodeStates] };
    }

    function* insertHeadSteps(listCopy) {
      const value = Math.floor(Math.random() * 90) + 10;
      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `准备头插：newNode = ${value}`;
      yield { list: [...listCopy], states: [...nodeStates] };

      listCopy.unshift(value);
      nodeStates = new Array(listCopy.length).fill('normal');
      nodeStates[0] = 'inserting';
      msgText = `newNode.next → 原 head；head → newNode，O(1)`;
      yield { list: [...listCopy], states: [...nodeStates] };

      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `头插完成，链表长度 = ${listCopy.length}`;
      yield { list: [...listCopy], states: [...nodeStates] };
    }

    function* insertTailSteps(listCopy) {
      const value = Math.floor(Math.random() * 90) + 10;
      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `准备尾插：newNode = ${value}`;
      yield { list: [...listCopy], states: [...nodeStates] };

      for (let i = 0; i < listCopy.length; i++) {
        nodeStates = new Array(listCopy.length).fill('normal');
        nodeStates[i] = 'traversing';
        msgText = i === listCopy.length - 1
          ? `cur 到达尾节点[${i}]，cur.next = NULL，在此插入`
          : `cur → 节点[${i}]，cur.next 不为 NULL，继续后移`;
        yield { list: [...listCopy], states: [...nodeStates] };
      }

      listCopy.push(value);
      nodeStates = new Array(listCopy.length).fill('normal');
      nodeStates[listCopy.length - 1] = 'inserting';
      msgText = `尾节点.next → newNode，O(n)`;
      yield { list: [...listCopy], states: [...nodeStates] };

      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `尾插完成，链表长度 = ${listCopy.length}`;
      yield { list: [...listCopy], states: [...nodeStates] };
    }

    function* deleteHeadSteps(listCopy) {
      if (listCopy.length <= 2) {
        nodeStates = new Array(listCopy.length).fill('normal');
        msgText = '节点过少（最少保留 2 个）';
        yield { list: [...listCopy], states: [...nodeStates] };
        return;
      }

      nodeStates = new Array(listCopy.length).fill('normal');
      nodeStates[0] = 'deleting';
      msgText = `准备头删：temp → head(=${listCopy[0]})`;
      yield { list: [...listCopy], states: [...nodeStates] };

      listCopy.shift();
      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `head → head.next；delete temp，O(1)`;
      yield { list: [...listCopy], states: [...nodeStates] };

      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `头删完成，链表长度 = ${listCopy.length}`;
      yield { list: [...listCopy], states: [...nodeStates] };
    }

    function* deleteTailSteps(listCopy) {
      if (listCopy.length <= 2) {
        nodeStates = new Array(listCopy.length).fill('normal');
        msgText = '节点过少（最少保留 2 个）';
        yield { list: [...listCopy], states: [...nodeStates] };
        return;
      }

      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = '准备尾删';
      yield { list: [...listCopy], states: [...nodeStates] };

      for (let i = 0; i < listCopy.length - 1; i++) {
        nodeStates = new Array(listCopy.length).fill('normal');
        nodeStates[i] = 'traversing';
        msgText = i === listCopy.length - 2
          ? `cur 停在倒数第二节点[${i}]，cur.next.next = NULL`
          : `cur → 节点[${i}]，继续寻找倒数第二个`;
        yield { list: [...listCopy], states: [...nodeStates] };
      }

      nodeStates = new Array(listCopy.length).fill('normal');
      nodeStates[listCopy.length - 1] = 'deleting';
      msgText = `删除尾节点 ${listCopy[listCopy.length - 1]}，cur.next → NULL`;
      yield { list: [...listCopy], states: [...nodeStates] };

      listCopy.pop();
      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `尾删完成，链表长度 = ${listCopy.length}`;
      yield { list: [...listCopy], states: [...nodeStates] };
    }

    function* searchSteps(listCopy) {
      const target = listCopy[Math.floor(Math.random() * listCopy.length)] || Math.floor(Math.random() * 90) + 10;

      nodeStates = new Array(listCopy.length).fill('normal');
      msgText = `搜索目标值 ${target}`;
      yield { list: [...listCopy], states: [...nodeStates] };

      let found = false;
      for (let i = 0; i < listCopy.length; i++) {
        nodeStates = new Array(listCopy.length).fill('normal');
        nodeStates[i] = 'traversing';
        msgText = `cur → 节点[${i}] = ${listCopy[i]}，与 ${target} 比较`;
        yield { list: [...listCopy], states: [...nodeStates] };

        if (listCopy[i] === target) {
          nodeStates = new Array(listCopy.length).fill('normal');
          nodeStates[i] = 'found';
          msgText = `找到！节点[${i}] = ${target}，返回索引 ${i}`;
          yield { list: [...listCopy], states: [...nodeStates] };
          found = true;
          break;
        }
      }

      if (!found) {
        nodeStates = new Array(listCopy.length).fill('not-found');
        msgText = `遍历至 NULL，未找到 ${target}，返回 -1`;
        yield { list: [...listCopy], states: [...nodeStates] };
      }
    }

    const shuffleArr = () => {
      resetAll();
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      nodeStates = new Array(list.length).fill('normal');
      msgText = '';
      drawList();
    };

    const resetAll = () => {
      list = getRandomList();
      nodeStates = new Array(list.length).fill('normal');
      msgText = '';
      runFlag = false;
      stepQueue = [];
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = 'traverse';
      }
      drawList();

      if (!currentIsAuto) {
        const stepsMap = {
          'traverse': traverseSteps,
          'insert_head': insertHeadSteps,
          'insert_tail': insertTailSteps,
          'delete_head': deleteHeadSteps,
          'delete_tail': deleteTailSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...list]) : traverseSteps([...list]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      }
    };

    const startRun = async (operation = 'traverse') => {
      if (runFlag) return;

      currentOperation = operation;
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = operation;
      }
      runFlag = true;

      if (!currentIsAuto) {
        nodeStates = new Array(list.length).fill('normal');
        msgText = '';
        stepQueue = [];
        drawList();

        const stepsMap = {
          'traverse': traverseSteps,
          'insert_head': insertHeadSteps,
          'insert_tail': insertTailSteps,
          'delete_head': deleteHeadSteps,
          'delete_tail': deleteTailSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...list]) : traverseSteps([...list]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
        runFlag = false;
        return;
      }

      nodeStates = new Array(list.length).fill('normal');
      msgText = '';
      drawList();

      const stepsMap = {
        'traverse': traverseSteps,
        'insert_head': insertHeadSteps,
        'insert_tail': insertTailSteps,
        'delete_head': deleteHeadSteps,
        'delete_tail': deleteTailSteps,
        'search': searchSteps
      };
      const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...list]) : traverseSteps([...list]);

      for (let step of stepGenerator) {
        if (!runFlag) break;

        list = step.list;
        nodeStates = step.states;
        drawList();

        await new Promise(resolve => setTimeout(resolve, currentSpeed));
      }

      nodeStates = new Array(list.length).fill('normal');
      drawList();
      runFlag = false;
    };

    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        list = step.list;
        nodeStates = step.states;
        drawList();
      }
    };

    const setSpeed = (newSpeed) => {
      currentSpeed = newSpeed;
    };

    const setAuto = (auto) => {
      currentIsAuto = auto;

      if (!auto) {
        nodeStates = new Array(list.length).fill('normal');
        msgText = '';
        stepQueue = [];
        drawList();

        const stepsMap = {
          'traverse': traverseSteps,
          'insert_head': insertHeadSteps,
          'insert_tail': insertTailSteps,
          'delete_head': deleteHeadSteps,
          'delete_tail': deleteTailSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...list]) : traverseSteps([...list]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      } else {
        stepQueue = [];
      }
    };

    const hasNextStep = () => {
      return stepQueue.length > 0;
    };

    drawList();

    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto,
      hasNextStep
    };
  },

  initStack: function(options = {}) {
    const {
      canvas = null,
      speed = 300,
      isAuto = true,
      opType = null
    } = options;

    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const CELL_W = 72;
    const CELL_H = 44;
    const MAX_SIZE = 8;

    const getRandomStack = () => {
      const n = Math.floor(Math.random() * 3) + 3;
      return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    };

    let stack = getRandomStack();
    let states = [];
    let msgText = '';
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let currentOperation = 'push';
    let opTypeRef = opType;

    states = new Array(stack.length).fill('normal');

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    const getColor = (state) => {
      const map = {
        'normal':   { bg: '#3b82f6', text: '#e2e8f0' },
        'top':      { bg: '#f59e0b', text: '#1e293b' },
        'pushing':  { bg: '#22c55e', text: '#ffffff' },
        'popping':  { bg: '#ef4444', text: '#ffffff' },
        'empty':    { bg: '#64748b', text: '#ffffff' }
      };
      return map[state] || map['normal'];
    };

    const drawStack = () => {
      if (!ctx || !canvasEl) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      if (msgText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msgText, canvasEl.width / 2, 26);
      }

      const n = stack.length;
      const startX = (canvasEl.width - CELL_W) / 2;
      const bottomY = canvasEl.height - 40;

      if (n === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 14px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(栈空)', canvasEl.width / 2, bottomY - 30);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        roundRect(ctx, startX - 8, bottomY - 120, CELL_W + 16, 120, 10);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      const containerH = n * CELL_H + (n - 1) * 4 + 24;
      roundRect(ctx, startX - 8, bottomY - containerH, CELL_W + 16, containerH, 10);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < n; i++) {
        const x = startX;
        const y = bottomY - (n - i) * (CELL_H + 4) + 4;
        const state = states[i] || 'normal';
        const color = getColor(state);

        ctx.fillStyle = color.bg;
        roundRect(ctx, x, y, CELL_W, CELL_H, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, CELL_W, CELL_H, 8);
        ctx.stroke();

        if (state !== 'normal') {
          ctx.strokeStyle = color.bg;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.5;
          roundRect(ctx, x - 2, y - 2, CELL_W + 4, CELL_H + 4, 10);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = color.text;
        ctx.font = 'bold 14px "JetBrains Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stack[i].toString(), x + CELL_W / 2, y + CELL_H / 2);

        if (i === n - 1) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText('← TOP', x - 52, y + CELL_H / 2);
        }
      }
    };

    function* pushSteps(stackCopy) {
      if (stackCopy.length >= MAX_SIZE) {
        states = new Array(stackCopy.length).fill('normal');
        msgText = '栈已满，无法 push（最大容量 ' + MAX_SIZE + '）';
        yield { list: [...stackCopy], states: [...states] };
        return;
      }

      const value = Math.floor(Math.random() * 90) + 10;
      states = new Array(stackCopy.length).fill('normal');
      msgText = `准备 push(${value})`;
      yield { list: [...stackCopy], states: [...states] };

      stackCopy.push(value);
      states = new Array(stackCopy.length).fill('normal');
      states[stackCopy.length - 1] = 'pushing';
      msgText = `${value} 入栈 → TOP，O(1)`;
      yield { list: [...stackCopy], states: [...states] };

      states = new Array(stackCopy.length).fill('normal');
      states[stackCopy.length - 1] = 'top';
      msgText = `push 完成，栈深度 = ${stackCopy.length}`;
      yield { list: [...stackCopy], states: [...states] };
    }

    function* popSteps(stackCopy) {
      if (stackCopy.length === 0) {
        states = [];
        msgText = '栈空，无法 pop';
        yield { list: [], states: [] };
        return;
      }

      states = new Array(stackCopy.length).fill('normal');
      states[stackCopy.length - 1] = 'top';
      msgText = `准备 pop()，TOP = ${stackCopy[stackCopy.length - 1]}`;
      yield { list: [...stackCopy], states: [...states] };

      const val = stackCopy[stackCopy.length - 1];
      states = new Array(stackCopy.length).fill('normal');
      states[stackCopy.length - 1] = 'popping';
      msgText = `弹出 ${val}，TOP 下移`;
      yield { list: [...stackCopy], states: [...states] };

      stackCopy.pop();
      states = new Array(stackCopy.length).fill('normal');
      if (stackCopy.length > 0) states[stackCopy.length - 1] = 'top';
      msgText = `pop 完成，返回 ${val}，栈深度 = ${stackCopy.length}`;
      yield { list: [...stackCopy], states: [...states] };
    }

    function* peekSteps(stackCopy) {
      if (stackCopy.length === 0) {
        states = [];
        msgText = '栈空，peek 返回 null';
        yield { list: [], states: [] };
        return;
      }

      states = new Array(stackCopy.length).fill('normal');
      states[stackCopy.length - 1] = 'top';
      msgText = `peek() → TOP = ${stackCopy[stackCopy.length - 1]}，O(1)`;
      yield { list: [...stackCopy], states: [...states] };
    }

    function* isEmptySteps(stackCopy) {
      states = new Array(stackCopy.length).fill('normal');
      msgText = stackCopy.length === 0 ? 'isEmpty() → true，栈为空' : `isEmpty() → false，栈有 ${stackCopy.length} 个元素`;
      yield { list: [...stackCopy], states: [...states] };
    }

    const shuffleArr = () => {
      resetAll();
      for (let i = stack.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [stack[i], stack[j]] = [stack[j], stack[i]];
      }
      states = new Array(stack.length).fill('normal');
      msgText = '';
      drawStack();
    };

    const resetAll = () => {
      stack = getRandomStack();
      states = new Array(stack.length).fill('normal');
      msgText = '';
      runFlag = false;
      stepQueue = [];
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = 'push';
      }
      drawStack();

      if (!currentIsAuto) {
        const stepsMap = {
          'push': pushSteps,
          'pop': popSteps,
          'peek': peekSteps,
          'isEmpty': isEmptySteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...stack]) : pushSteps([...stack]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      }
    };

    const startRun = async (operation = 'push') => {
      if (runFlag) return;

      currentOperation = operation;
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = operation;
      }
      runFlag = true;

      if (!currentIsAuto) {
        states = new Array(stack.length).fill('normal');
        msgText = '';
        stepQueue = [];
        drawStack();

        const stepsMap = {
          'push': pushSteps,
          'pop': popSteps,
          'peek': peekSteps,
          'isEmpty': isEmptySteps
        };
        const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...stack]) : pushSteps([...stack]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
        runFlag = false;
        return;
      }

      states = new Array(stack.length).fill('normal');
      msgText = '';
      drawStack();

      const stepsMap = {
        'push': pushSteps,
        'pop': popSteps,
        'peek': peekSteps,
        'isEmpty': isEmptySteps
      };
      const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...stack]) : pushSteps([...stack]);

      for (let step of stepGenerator) {
        if (!runFlag) break;

        stack = step.list;
        states = step.states;
        drawStack();

        await new Promise(resolve => setTimeout(resolve, currentSpeed));
      }

      runFlag = false;
    };

    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        stack = step.list;
        states = step.states;
        drawStack();
      }
    };

    const setSpeed = (newSpeed) => { currentSpeed = newSpeed; };

    const setAuto = (auto) => {
      currentIsAuto = auto;

      if (!auto) {
        states = new Array(stack.length).fill('normal');
        msgText = '';
        stepQueue = [];
        drawStack();

        const stepsMap = {
          'push': pushSteps,
          'pop': popSteps,
          'peek': peekSteps,
          'isEmpty': isEmptySteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...stack]) : pushSteps([...stack]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      } else {
        stepQueue = [];
      }
    };

    const hasNextStep = () => stepQueue.length > 0;

    drawStack();

    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto,
      hasNextStep
    };
  },

  initQueue: function(options = {}) {
    const {
      canvas = null,
      speed = 300,
      isAuto = true,
      opType = null
    } = options;

    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const CELL_W = 64;
    const CELL_H = 48;
    const GAP = 4;
    const MAX_SIZE = 8;

    const getRandomQueue = () => {
      const n = Math.floor(Math.random() * 3) + 3;
      return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    };

    let queue = getRandomQueue();
    let states = [];
    let msgText = '';
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let currentOperation = 'enqueue';
    let opTypeRef = opType;

    states = new Array(queue.length).fill('normal');

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    const getColor = (state) => {
      const map = {
        'normal':    { bg: '#3b82f6', text: '#e2e8f0' },
        'front':     { bg: '#f59e0b', text: '#1e293b' },
        'rear':      { bg: '#a855f7', text: '#ffffff' },
        'enqueuing': { bg: '#22c55e', text: '#ffffff' },
        'dequeuing': { bg: '#ef4444', text: '#ffffff' },
        'empty':     { bg: '#64748b', text: '#ffffff' }
      };
      return map[state] || map['normal'];
    };

    const drawQueue = () => {
      if (!ctx || !canvasEl) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      if (msgText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msgText, canvasEl.width / 2, 26);
      }

      const n = queue.length;
      const totalW = n * CELL_W + (n - 1) * GAP;
      const startX = Math.max(50, (canvasEl.width - totalW) / 2);
      const y = 70;

      if (n === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 14px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';

        const boxX = startX;
        const boxW = Math.max(totalW, 120);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        roundRect(ctx, boxX - 8, y - 8, boxW + 16, CELL_H + 16, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillText('(队空)', boxX + boxW / 2, y + CELL_H / 2);
        return;
      }

      for (let i = 0; i < n; i++) {
        const x = startX + i * (CELL_W + GAP);
        const state = states[i] || 'normal';
        const color = getColor(state);

        ctx.fillStyle = color.bg;
        roundRect(ctx, x, y, CELL_W, CELL_H, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, CELL_W, CELL_H, 8);
        ctx.stroke();

        if (state !== 'normal') {
          ctx.strokeStyle = color.bg;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.5;
          roundRect(ctx, x - 2, y - 2, CELL_W + 4, CELL_H + 4, 10);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = color.text;
        ctx.font = 'bold 14px "JetBrains Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(queue[i].toString(), x + CELL_W / 2, y + CELL_H / 2);

        if (i === 0) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('FRONT', x + CELL_W / 2, y - 16);
        }
        if (i === n - 1) {
          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('REAR', x + CELL_W / 2, y + CELL_H + 16);
        }
      }
    };

    function* enqueueSteps(queueCopy) {
      if (queueCopy.length >= MAX_SIZE) {
        states = new Array(queueCopy.length).fill('normal');
        msgText = '队列已满，无法 enqueue（最大容量 ' + MAX_SIZE + '）';
        yield { list: [...queueCopy], states: [...states] };
        return;
      }

      const value = Math.floor(Math.random() * 90) + 10;
      states = new Array(queueCopy.length).fill('normal');
      msgText = `准备 enqueue(${value})`;
      yield { list: [...queueCopy], states: [...states] };

      queueCopy.push(value);
      states = new Array(queueCopy.length).fill('normal');
      states[queueCopy.length - 1] = 'enqueuing';
      msgText = `${value} 入队 → REAR，O(1)`;
      yield { list: [...queueCopy], states: [...states] };

      states = new Array(queueCopy.length).fill('normal');
      states[0] = 'front';
      states[queueCopy.length - 1] = 'rear';
      msgText = `enqueue 完成，队列长度 = ${queueCopy.length}`;
      yield { list: [...queueCopy], states: [...states] };
    }

    function* dequeueSteps(queueCopy) {
      if (queueCopy.length === 0) {
        states = [];
        msgText = '队空，无法 dequeue';
        yield { list: [], states: [] };
        return;
      }

      states = new Array(queueCopy.length).fill('normal');
      states[0] = 'front';
      msgText = `准备 dequeue()，FRONT = ${queueCopy[0]}`;
      yield { list: [...queueCopy], states: [...states] };

      const val = queueCopy[0];
      states = new Array(queueCopy.length).fill('normal');
      states[0] = 'dequeuing';
      msgText = `${val} 出队，后续元素前移`;
      yield { list: [...queueCopy], states: [...states] };

      queueCopy.shift();
      states = new Array(queueCopy.length).fill('normal');
      if (queueCopy.length > 0) {
        states[0] = 'front';
        states[queueCopy.length - 1] = 'rear';
      }
      msgText = `dequeue 完成，返回 ${val}，队列长度 = ${queueCopy.length}`;
      yield { list: [...queueCopy], states: [...states] };
    }

    function* peekSteps(queueCopy) {
      if (queueCopy.length === 0) {
        states = [];
        msgText = '队空，peek 返回 null';
        yield { list: [], states: [] };
        return;
      }

      states = new Array(queueCopy.length).fill('normal');
      states[0] = 'front';
      msgText = `peek() → FRONT = ${queueCopy[0]}，O(1)`;
      yield { list: [...queueCopy], states: [...states] };
    }

    function* isEmptySteps(queueCopy) {
      states = new Array(queueCopy.length).fill('normal');
      msgText = queueCopy.length === 0 ? 'isEmpty() → true，队列为空' : `isEmpty() → false，队列有 ${queueCopy.length} 个元素`;
      yield { list: [...queueCopy], states: [...states] };
    }

    const shuffleArr = () => {
      resetAll();
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
      states = new Array(queue.length).fill('normal');
      states[0] = 'front';
      if (queue.length > 0) states[queue.length - 1] = 'rear';
      msgText = '';
      drawQueue();
    };

    const resetAll = () => {
      queue = getRandomQueue();
      states = new Array(queue.length).fill('normal');
      states[0] = 'front';
      if (queue.length > 0) states[queue.length - 1] = 'rear';
      msgText = '';
      runFlag = false;
      stepQueue = [];
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = 'enqueue';
      }
      drawQueue();

      if (!currentIsAuto) {
        const stepsMap = {
          'enqueue': enqueueSteps,
          'dequeue': dequeueSteps,
          'peek': peekSteps,
          'isEmpty': isEmptySteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...queue]) : enqueueSteps([...queue]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      }
    };

    const startRun = async (operation = 'enqueue') => {
      if (runFlag) return;

      currentOperation = operation;
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = operation;
      }
      runFlag = true;

      if (!currentIsAuto) {
        states = new Array(queue.length).fill('normal');
        if (queue.length > 0) { states[0] = 'front'; states[queue.length - 1] = 'rear'; }
        msgText = '';
        stepQueue = [];
        drawQueue();

        const stepsMap = {
          'enqueue': enqueueSteps,
          'dequeue': dequeueSteps,
          'peek': peekSteps,
          'isEmpty': isEmptySteps
        };
        const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...queue]) : enqueueSteps([...queue]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
        runFlag = false;
        return;
      }

      states = new Array(queue.length).fill('normal');
      if (queue.length > 0) { states[0] = 'front'; states[queue.length - 1] = 'rear'; }
      msgText = '';
      drawQueue();

      const stepsMap = {
        'enqueue': enqueueSteps,
        'dequeue': dequeueSteps,
        'peek': peekSteps,
        'isEmpty': isEmptySteps
      };
      const stepGenerator = stepsMap[operation] ? stepsMap[operation]([...queue]) : enqueueSteps([...queue]);

      for (let step of stepGenerator) {
        if (!runFlag) break;

        queue = step.list;
        states = step.states;
        drawQueue();

        await new Promise(resolve => setTimeout(resolve, currentSpeed));
      }

      runFlag = false;
    };

    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        queue = step.list;
        states = step.states;
        drawQueue();
      }
    };

    const setSpeed = (newSpeed) => { currentSpeed = newSpeed; };

    const setAuto = (auto) => {
      currentIsAuto = auto;

      if (!auto) {
        states = new Array(queue.length).fill('normal');
        if (queue.length > 0) { states[0] = 'front'; states[queue.length - 1] = 'rear'; }
        msgText = '';
        stepQueue = [];
        drawQueue();

        const stepsMap = {
          'enqueue': enqueueSteps,
          'dequeue': dequeueSteps,
          'peek': peekSteps,
          'isEmpty': isEmptySteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]([...queue]) : enqueueSteps([...queue]);
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      } else {
        stepQueue = [];
      }
    };

    const hasNextStep = () => stepQueue.length > 0;

    drawQueue();

    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto,
      hasNextStep
    };
  },

  initTree: function(options = {}) {
    const {
      canvas = null,
      speed = 300,
      isAuto = true,
      opType = null
    } = options;

    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const NODE_R = 22;
    const LEVEL_H = 78;

    let nodeIdCounter = 0;

    const makeNode = (value) => ({ id: nodeIdCounter++, value, children: [] });

    const buildRandomTree = (depth, maxDepth) => {
      if (depth >= maxDepth) {
        return makeNode(Math.floor(Math.random() * 90) + 10);
      }
      const node = makeNode(Math.floor(Math.random() * 90) + 10);
      const numChildren = depth === 0 ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numChildren; i++) {
        if (Math.random() < 0.25 && depth + 1 >= maxDepth) continue;
        node.children.push(buildRandomTree(depth + 1, maxDepth));
      }
      if (node.children.length === 0) {
        node.children.push(makeNode(Math.floor(Math.random() * 90) + 10));
      }
      return node;
    };

    const generateTree = () => {
      nodeIdCounter = 0;
      return buildRandomTree(0, Math.floor(Math.random() * 2) + 3);
    };

    const deepClone = (node) => {
      if (!node) return null;
      return {
        id: node.id,
        value: node.value,
        children: node.children.map(deepClone)
      };
    };

    const collectNodes = (node, arr) => {
      if (!node) return arr;
      arr.push(node);
      for (const child of node.children) collectNodes(child, arr);
      return arr;
    };

    const findNodeById = (node, id) => {
      if (!node) return null;
      if (node.id === id) return node;
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
      return null;
    };

    let root = generateTree();
    let highlightId = -1;
    let msgText = '';
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let currentOperation = 'traverse';
    let opTypeRef = opType;

    // ── Layout ──────────────────────────────────────────

    const nodePositions = {};

    const computeLayout = () => {
      for (const key in nodePositions) delete nodePositions[key];

      const measureExtent = (node, depth) => {
        if (!node || node.children.length === 0) return 1;
        let total = 0;
        for (const child of node.children) total += measureExtent(child, depth + 1);
        return total;
      };

      const assignPosition = (node, depth, left, right) => {
        if (!node) return;
        const x = (left + right) / 2;
        const y = 50 + depth * LEVEL_H;
        nodePositions[node.id] = { x, y };

        if (node.children.length === 0) return;

        const totalExtent = measureExtent(node, depth);
        const childWidth = (right - left) / totalExtent;
        let curLeft = left;

        for (const child of node.children) {
          const childExtent = measureExtent(child, depth + 1);
          const childRight = curLeft + childExtent * childWidth;
          assignPosition(child, depth + 1, curLeft, childRight);
          curLeft = childRight;
        }
      };

      const margin = 60;
      assignPosition(root, 0, margin, (canvasEl ? canvasEl.width : 800) - margin);
    };

    // ── Drawing ─────────────────────────────────────────

    const getNodeColor = (id) => {
      if (id === highlightId) return { bg: '#f59e0b', text: '#1e293b', border: '#f59e0b' };
      return { bg: '#3b82f6', text: '#e2e8f0', border: 'rgba(255,255,255,0.2)' };
    };

    const drawTree = () => {
      if (!ctx || !canvasEl) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      if (msgText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msgText, canvasEl.width / 2, 24);
      }

      computeLayout();

      const drawEdges = (node) => {
        if (!node) return;
        const pos = nodePositions[node.id];
        if (!pos) return;
        for (const child of node.children) {
          const childPos = nodePositions[child.id];
          if (!childPos) continue;
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(childPos.x, childPos.y);
          ctx.stroke();
          drawEdges(child);
        }
      };

      const drawNodeCircle = (node) => {
        if (!node) return;
        const pos = nodePositions[node.id];
        if (!pos) return;
        const color = getNodeColor(node.id);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_R, 0, Math.PI * 2);
        ctx.fillStyle = color.bg;
        ctx.fill();

        if (node.id === highlightId) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, NODE_R + 4, 0, Math.PI * 2);
          ctx.strokeStyle = color.border;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_R, 0, Math.PI * 2);
        ctx.strokeStyle = color.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = color.text;
        ctx.font = 'bold 13px "JetBrains Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.value.toString(), pos.x, pos.y);

        for (const child of node.children) drawNodeCircle(child);
      };

      drawEdges(root);
      drawNodeCircle(root);
    };

    // ── Step Generators ──────────────────────────────────

    function* traverseSteps(rootCopy) {
      highlightId = -1;
      msgText = '开始先序遍历（根 → 左 → 右）';
      yield { root: deepClone(rootCopy), highlight: -1 };

      function* preorder(node) {
        if (!node) return;
        highlightId = node.id;
        msgText = `访问节点 ${node.value}`;
        yield { root: deepClone(rootCopy), highlight: node.id };

        for (const child of node.children) {
          yield* preorder(child);
        }
      }

      yield* preorder(rootCopy);

      highlightId = -1;
      msgText = '遍历完成';
      yield { root: deepClone(rootCopy), highlight: -1 };
    }

    function* insertSteps(rootCopy) {
      const allNodes = collectNodes(rootCopy, []);
      if (allNodes.length >= 15) {
        highlightId = -1;
        msgText = '树节点过多（最多 15 个），无法继续插入';
        yield { root: deepClone(rootCopy), highlight: -1 };
        return;
      }

      const parent = allNodes[Math.floor(Math.random() * allNodes.length)];
      const value = Math.floor(Math.random() * 90) + 10;

      highlightId = parent.id;
      msgText = `选择父节点 ${parent.value}，准备插入子节点`;
      yield { root: deepClone(rootCopy), highlight: parent.id };

      const child = { id: nodeIdCounter++, value, children: [] };
      parent.children.push(child);
      highlightId = child.id;
      msgText = `${value} 作为 ${parent.value} 的子节点插入，O(1)`;
      yield { root: deepClone(rootCopy), highlight: child.id };

      highlightId = -1;
      msgText = `插入完成，节点数 = ${collectNodes(rootCopy, []).length}`;
      yield { root: deepClone(rootCopy), highlight: -1 };
    }

    function* searchSteps(rootCopy) {
      const allNodes = collectNodes(rootCopy, []);
      const target = allNodes[Math.floor(Math.random() * allNodes.length)].value;

      highlightId = -1;
      msgText = `DFS 搜索目标值 ${target}`;
      yield { root: deepClone(rootCopy), highlight: -1 };

      let found = false;

      function* dfs(node) {
        if (!node || found) return;

        highlightId = node.id;
        msgText = `访问节点 ${node.value}，与 ${target} 比较`;
        yield { root: deepClone(rootCopy), highlight: node.id };

        if (node.value === target) {
          highlightId = node.id;
          msgText = `找到！节点 ${node.value} = ${target}`;
          yield { root: deepClone(rootCopy), highlight: node.id };
          found = true;
          return;
        }

        for (const child of node.children) {
          yield* dfs(child);
          if (found) return;
        }
      }

      yield* dfs(rootCopy);

      if (!found) {
        highlightId = -1;
        msgText = `遍历整棵树，未找到 ${target}`;
        yield { root: deepClone(rootCopy), highlight: -1 };
      }
    }

    // ── Public API ─────────────────────────────────────

    const shuffleArr = () => {
      resetAll();
      drawTree();
    };

    const resetAll = () => {
      root = generateTree();
      highlightId = -1;
      msgText = '';
      runFlag = false;
      stepQueue = [];
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = 'traverse';
      }
      drawTree();

      if (!currentIsAuto) {
        const stepsMap = {
          'traverse': traverseSteps,
          'insert': insertSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation](deepClone(root)) : traverseSteps(deepClone(root));
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      }
    };

    const startRun = async (operation = 'traverse') => {
      if (runFlag) return;

      currentOperation = operation;
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = operation;
      }
      runFlag = true;

      if (!currentIsAuto) {
        highlightId = -1;
        msgText = '';
        stepQueue = [];
        drawTree();

        const stepsMap = {
          'traverse': traverseSteps,
          'insert': insertSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[operation] ? stepsMap[operation](deepClone(root)) : traverseSteps(deepClone(root));
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
        runFlag = false;
        return;
      }

      highlightId = -1;
      msgText = '';
      drawTree();

      const stepsMap = {
        'traverse': traverseSteps,
        'insert': insertSteps,
        'search': searchSteps
      };
      const stepGenerator = stepsMap[operation] ? stepsMap[operation](deepClone(root)) : traverseSteps(deepClone(root));

      for (let step of stepGenerator) {
        if (!runFlag) break;

        root = step.root;
        highlightId = step.highlight;
        drawTree();

        await new Promise(resolve => setTimeout(resolve, currentSpeed));
      }

      runFlag = false;
    };

    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        root = step.root;
        highlightId = step.highlight;
        drawTree();
      }
    };

    const setSpeed = (newSpeed) => { currentSpeed = newSpeed; };

    const setAuto = (auto) => {
      currentIsAuto = auto;

      if (!auto) {
        highlightId = -1;
        msgText = '';
        stepQueue = [];
        drawTree();

        const stepsMap = {
          'traverse': traverseSteps,
          'insert': insertSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation](deepClone(root)) : traverseSteps(deepClone(root));
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      } else {
        stepQueue = [];
      }
    };

    const hasNextStep = () => stepQueue.length > 0;

    drawTree();

    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto,
      hasNextStep
    };
  },

  initBinaryTree: function(options = {}) {
    const {
      canvas = null,
      speed = 300,
      isAuto = true,
      opType = null
    } = options;

    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const NODE_R = 20;
    const LEVEL_H = 70;

    let nodeIdCounter = 0;

    const makeNode = (value, left, right) => ({ id: nodeIdCounter++, value, left: left || null, right: right || null });

    const buildRandomBST = (count) => {
      const values = [];
      for (let i = 0; i < count; i++) values.push(Math.floor(Math.random() * 90) + 10);

      const insert = (node, val) => {
        if (!node) return makeNode(val);
        if (val < node.value) node.left = insert(node.left, val);
        else node.right = insert(node.right, val);
        return node;
      };

      let root = null;
      for (const v of values) root = insert(root, v);
      return root;
    };

    const generateTree = () => {
      nodeIdCounter = 0;
      const n = Math.floor(Math.random() * 3) + 6;
      return buildRandomBST(n);
    };

    const deepClone = (node) => {
      if (!node) return null;
      return {
        id: node.id,
        value: node.value,
        left: deepClone(node.left),
        right: deepClone(node.right)
      };
    };

    const collectNodes = (node, arr) => {
      if (!node) return arr;
      arr.push(node);
      collectNodes(node.left, arr);
      collectNodes(node.right, arr);
      return arr;
    };

    let root = generateTree();
    let highlightId = -1;
    let highlightId2 = -1;
    let msgText = '';
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let currentOperation = 'preorder';
    let opTypeRef = opType;

    const nodePositions = {};

    const computeLayout = () => {
      for (const key in nodePositions) delete nodePositions[key];

      const getWidth = (node) => {
        if (!node) return 1;
        return getWidth(node.left) + getWidth(node.right);
      };

      const assignPosition = (node, depth, left, right) => {
        if (!node) return;
        const x = (left + right) / 2;
        const y = 44 + depth * LEVEL_H;
        nodePositions[node.id] = { x, y };

        const nodeWidth = (right - left) / getWidth(node);
        assignPosition(node.left, depth + 1, left, x - nodeWidth * 0.3);
        assignPosition(node.right, depth + 1, x + nodeWidth * 0.3, right);
      };

      const margin = 56;
      assignPosition(root, 0, margin, (canvasEl ? canvasEl.width : 800) - margin);
    };

    const getNodeColor = (id) => {
      if (id === highlightId) return { bg: '#f59e0b', text: '#1e293b', border: '#f59e0b' };
      if (id === highlightId2) return { bg: '#22c55e', text: '#ffffff', border: '#22c55e' };
      return { bg: '#3b82f6', text: '#e2e8f0', border: 'rgba(255,255,255,0.2)' };
    };

    const drawTree = () => {
      if (!ctx || !canvasEl) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      if (msgText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msgText, canvasEl.width / 2, 22);
      }

      computeLayout();

      const drawNode = (node) => {
        if (!node) return;
        const pos = nodePositions[node.id];
        if (!pos) return;

        if (node.left && nodePositions[node.left.id]) {
          const cp = nodePositions[node.left.id];
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y + NODE_R);
          ctx.lineTo(cp.x, cp.y - NODE_R);
          ctx.stroke();
        }
        if (node.right && nodePositions[node.right.id]) {
          const cp = nodePositions[node.right.id];
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y + NODE_R);
          ctx.lineTo(cp.x, cp.y - NODE_R);
          ctx.stroke();
        }

        drawNode(node.left);
        drawNode(node.right);

        const color = getNodeColor(node.id);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_R, 0, Math.PI * 2);
        ctx.fillStyle = color.bg;
        ctx.fill();

        if (node.id === highlightId || node.id === highlightId2) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, NODE_R + 4, 0, Math.PI * 2);
          ctx.strokeStyle = color.border;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_R, 0, Math.PI * 2);
        ctx.strokeStyle = color.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = color.text;
        ctx.font = 'bold 12px "JetBrains Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.value.toString(), pos.x, pos.y);
      };

      drawNode(root);

      if (collectNodes(root, []).length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 14px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(空树)', canvasEl.width / 2, canvasEl.height / 2);
      }
    };

    function* preorderSteps(rootCopy) {
      highlightId = -1;
      msgText = '开始先序遍历（根 → 左 → 右）';
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };

      function* walk(node) {
        if (!node) return;
        highlightId = node.id;
        msgText = `访问节点 ${node.value}`;
        yield { root: deepClone(rootCopy), highlight: node.id, highlight2: -1 };
        yield* walk(node.left);
        yield* walk(node.right);
      }
      yield* walk(rootCopy);

      highlightId = -1;
      msgText = '先序遍历完成';
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };
    }

    function* inorderSteps(rootCopy) {
      highlightId = -1;
      msgText = '开始中序遍历（左 → 根 → 右）';
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };

      function* walk(node) {
        if (!node) return;
        yield* walk(node.left);
        highlightId = node.id;
        msgText = `访问节点 ${node.value}`;
        yield { root: deepClone(rootCopy), highlight: node.id, highlight2: -1 };
        yield* walk(node.right);
      }
      yield* walk(rootCopy);

      highlightId = -1;
      msgText = '中序遍历完成';
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };
    }

    function* postorderSteps(rootCopy) {
      highlightId = -1;
      msgText = '开始后序遍历（左 → 右 → 根）';
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };

      function* walk(node) {
        if (!node) return;
        yield* walk(node.left);
        yield* walk(node.right);
        highlightId = node.id;
        msgText = `访问节点 ${node.value}`;
        yield { root: deepClone(rootCopy), highlight: node.id, highlight2: -1 };
      }
      yield* walk(rootCopy);

      highlightId = -1;
      msgText = '后序遍历完成';
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };
    }

    function* insertSteps(rootCopy) {
      const allNodes = collectNodes(rootCopy, []);
      if (allNodes.length >= 12) {
        highlightId = -1;
        msgText = '节点过多（最多 12 个），无法继续插入';
        yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };
        return;
      }

      const value = Math.floor(Math.random() * 90) + 10;
      highlightId = -1;
      msgText = `准备插入 ${value}（BST 规则）`;
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };

      let cur = rootCopy;
      let path = [];

      while (cur) {
        path.push(cur);
        highlightId = cur.id;
        msgText = `比较 ${value} 与 ${cur.value}：${value < cur.value ? '往左子树' : '往右子树'}`;
        yield { root: deepClone(rootCopy), highlight: cur.id, highlight2: -1 };

        if (value < cur.value) {
          if (!cur.left) {
            cur.left = makeNode(value);
            highlightId2 = cur.left.id;
            msgText = `${value} 作为 ${cur.value} 的左子节点插入`;
            yield { root: deepClone(rootCopy), highlight: cur.id, highlight2: cur.left.id };
            break;
          }
          cur = cur.left;
        } else {
          if (!cur.right) {
            cur.right = makeNode(value);
            highlightId2 = cur.right.id;
            msgText = `${value} 作为 ${cur.value} 的右子节点插入`;
            yield { root: deepClone(rootCopy), highlight: cur.id, highlight2: cur.right.id };
            break;
          }
          cur = cur.right;
        }
      }

      highlightId = -1;
      highlightId2 = -1;
      msgText = `插入完成，节点数 = ${collectNodes(rootCopy, []).length}`;
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };
    }

    function* searchSteps(rootCopy) {
      const allNodes = collectNodes(rootCopy, []);
      const target = allNodes[Math.floor(Math.random() * allNodes.length)].value;

      highlightId = -1;
      msgText = `BST 搜索目标值 ${target}`;
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };

      let cur = rootCopy;
      while (cur) {
        highlightId = cur.id;
        msgText = `比较 ${target} 与 ${cur.value}`;
        yield { root: deepClone(rootCopy), highlight: cur.id, highlight2: -1 };

        if (cur.value === target) {
          highlightId = cur.id;
          msgText = `找到！节点 ${cur.value} = ${target}`;
          yield { root: deepClone(rootCopy), highlight: cur.id, highlight2: -1 };
          return;
        }
        cur = target < cur.value ? cur.left : cur.right;
      }

      highlightId = -1;
      msgText = `未找到 ${target}`;
      yield { root: deepClone(rootCopy), highlight: -1, highlight2: -1 };
    }

    const shuffleArr = () => { resetAll(); drawTree(); };

    const resetAll = () => {
      root = generateTree();
      highlightId = -1;
      highlightId2 = -1;
      msgText = '';
      runFlag = false;
      stepQueue = [];
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = 'preorder';
      }
      drawTree();

      if (!currentIsAuto) {
        const stepsMap = {
          'preorder': preorderSteps,
          'inorder': inorderSteps,
          'postorder': postorderSteps,
          'insert': insertSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation](deepClone(root)) : preorderSteps(deepClone(root));
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      }
    };

    const startRun = async (operation = 'preorder') => {
      if (runFlag) return;

      currentOperation = operation;
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = operation;
      }
      runFlag = true;

      if (!currentIsAuto) {
        highlightId = -1;
        highlightId2 = -1;
        msgText = '';
        stepQueue = [];
        drawTree();

        const stepsMap = {
          'preorder': preorderSteps,
          'inorder': inorderSteps,
          'postorder': postorderSteps,
          'insert': insertSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[operation] ? stepsMap[operation](deepClone(root)) : preorderSteps(deepClone(root));
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
        runFlag = false;
        return;
      }

      highlightId = -1;
      highlightId2 = -1;
      msgText = '';
      drawTree();

      const stepsMap = {
        'preorder': preorderSteps,
        'inorder': inorderSteps,
        'postorder': postorderSteps,
        'insert': insertSteps,
        'search': searchSteps
      };
      const stepGenerator = stepsMap[operation] ? stepsMap[operation](deepClone(root)) : preorderSteps(deepClone(root));

      for (let step of stepGenerator) {
        if (!runFlag) break;

        root = step.root;
        highlightId = step.highlight;
        highlightId2 = step.highlight2;
        drawTree();

        await new Promise(resolve => setTimeout(resolve, currentSpeed));
      }

      runFlag = false;
    };

    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        root = step.root;
        highlightId = step.highlight;
        highlightId2 = step.highlight2;
        drawTree();
      }
    };

    const setSpeed = (newSpeed) => { currentSpeed = newSpeed; };

    const setAuto = (auto) => {
      currentIsAuto = auto;

      if (!auto) {
        highlightId = -1;
        highlightId2 = -1;
        msgText = '';
        stepQueue = [];
        drawTree();

        const stepsMap = {
          'preorder': preorderSteps,
          'inorder': inorderSteps,
          'postorder': postorderSteps,
          'insert': insertSteps,
          'search': searchSteps
        };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation](deepClone(root)) : preorderSteps(deepClone(root));
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      } else {
        stepQueue = [];
      }
    };

    const hasNextStep = () => stepQueue.length > 0;

    drawTree();

    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto,
      hasNextStep
    };
  },

  initGraph: function(options = {}) {
    const {
      canvas = null,
      speed = 300,
      isAuto = true,
      opType = null
    } = options;

    const canvasEl = canvas || document.querySelector('canvas');
    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    const NODE_R = 22;

    const genGraph = (vertices) => {
      const pos = [];
      const cx = (canvasEl ? canvasEl.width : 700) / 2;
      const cy = (canvasEl ? canvasEl.height : 400) / 2;
      const r = Math.min(cx, cy) - 60;

      for (let i = 0; i < vertices; i++) {
        const angle = (2 * Math.PI * i) / vertices - Math.PI / 2;
        pos.push({
          id: i,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle)
        });
      }

      const adj = Array.from({ length: vertices }, () => []);
      const edges = [];
      const edgeSet = new Set();

      for (let i = 0; i < vertices; i++) {
        const degree = Math.floor(Math.random() * 2) + 1;
        const attempts = [i + 1, i + 2, (i + vertices - 1) % vertices, (i + vertices - 2) % vertices];
        let added = 0;
        for (const j of attempts) {
          if (added >= degree) break;
          const v = ((j % vertices) + vertices) % vertices;
          const key = Math.min(i, v) + '_' + Math.max(i, v);
          if (v !== i && !edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push([i, v]);
            adj[i].push(v);
            adj[v].push(i);
            added++;
          }
        }
      }

      if (edges.length < vertices - 1) {
        for (let i = 0; i < vertices; i++) {
          for (let j = i + 1; j < vertices; j++) {
            const key = i + '_' + j;
            if (!edgeSet.has(key)) {
              edgeSet.add(key);
              edges.push([i, j]);
              adj[i].push(j);
              adj[j].push(i);
              return { pos, adj, edges };
            }
          }
        }
      }

      return { pos, adj, edges };
    };

    const generateGraph = () => {
      const n = Math.floor(Math.random() * 3) + 5;
      return genGraph(n);
    };

    let { pos, adj, edges } = generateGraph();
    let visited = [];
    let highlighted = -1;
    let highlighted2 = -1;
    let msgText = '';
    let runFlag = false;
    let stepQueue = [];
    let currentSpeed = speed;
    let currentIsAuto = isAuto;
    let currentOperation = 'dfs';
    let opTypeRef = opType;

    visited = new Array(pos.length).fill(false);

    const deepCloneState = () => ({
      pos: pos.map(p => ({ ...p })),
      adj: adj.map(a => [...a]),
      edges: edges.map(e => [...e]),
      visited: [...visited],
      highlight: highlighted,
      highlight2: highlighted2
    });

    const getNodeColor = (id) => {
      if (id === highlighted) return { bg: '#f59e0b', text: '#1e293b', border: '#f59e0b' };
      if (id === highlighted2) return { bg: '#22c55e', text: '#ffffff', border: '#22c55e' };
      if (visited[id]) return { bg: '#22c55e', text: '#ffffff', border: 'rgba(34,197,94,0.4)' };
      return { bg: '#3b82f6', text: '#e2e8f0', border: 'rgba(255,255,255,0.2)' };
    };

    const drawGraph = () => {
      if (!ctx || !canvasEl) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      if (msgText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msgText, canvasEl.width / 2, 22);
      }

      for (const [u, v] of edges) {
        const from = pos[u];
        const to = pos[v];
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }

      for (let i = 0; i < pos.length; i++) {
        const p = pos[i];
        const color = getNodeColor(i);

        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
        ctx.fillStyle = color.bg;
        ctx.fill();

        if (i === highlighted || i === highlighted2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, NODE_R + 4, 0, Math.PI * 2);
          ctx.strokeStyle = color.border;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
        ctx.strokeStyle = color.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = color.text;
        ctx.font = 'bold 12px "JetBrains Mono", "Consolas", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), p.x, p.y);
      }
    };

    function* dfsSteps() {
      visited = new Array(pos.length).fill(false);
      highlighted = -1;
      msgText = '开始 DFS（从顶点 0 出发）';
      yield deepCloneState();

      function* walk(u) {
        visited[u] = true;
        highlighted = u;
        msgText = `访问顶点 ${u}`;
        yield deepCloneState();

        for (const v of adj[u]) {
          if (!visited[v]) {
            yield* walk(v);
          }
        }
      }
      yield* walk(0);

      highlighted = -1;
      msgText = 'DFS 遍历完成';
      yield deepCloneState();
    }

    function* bfsSteps() {
      visited = new Array(pos.length).fill(false);
      highlighted = -1;
      highlighted2 = -1;
      msgText = '开始 BFS（从顶点 0 出发）';
      yield deepCloneState();

      const queue = [0];
      visited[0] = true;

      while (queue.length > 0) {
        const u = queue.shift();
        highlighted = u;
        msgText = `访问顶点 ${u}`;
        yield deepCloneState();

        for (const v of adj[u]) {
          if (!visited[v]) {
            visited[v] = true;
            queue.push(v);
            highlighted2 = v;
            msgText = `发现顶点 ${v}，入队待访问`;
            yield deepCloneState();
            highlighted2 = -1;
          }
        }
      }

      highlighted = -1;
      msgText = 'BFS 遍历完成';
      yield deepCloneState();
    }

    function* addEdgeSteps() {
      const unconnected = [];
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          if (!edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) {
            unconnected.push([i, j]);
          }
        }
      }

      if (unconnected.length === 0) {
        msgText = '图已经是完全图，无法添加更多边';
        yield deepCloneState();
        return;
      }

      const [u, v] = unconnected[Math.floor(Math.random() * unconnected.length)];
      highlighted = u;
      highlighted2 = v;
      msgText = `选择顶点 ${u} 和 ${v}，准备添加边`;
      yield deepCloneState();

      edges.push([u, v]);
      adj[u].push(v);
      adj[v].push(u);
      msgText = `边 (${u}, ${v}) 添加完成，O(1)`;
      yield deepCloneState();

      highlighted = -1;
      highlighted2 = -1;
      msgText = `图现有 ${edges.length} 条边`;
      yield deepCloneState();
    }

    const shuffleArr = () => { resetAll(); drawGraph(); };

    const resetAll = () => {
      const g = generateGraph();
      pos = g.pos;
      adj = g.adj;
      edges = g.edges;
      visited = new Array(pos.length).fill(false);
      highlighted = -1;
      highlighted2 = -1;
      msgText = '';
      runFlag = false;
      stepQueue = [];
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = 'dfs';
      }
      drawGraph();

      if (!currentIsAuto) {
        const stepsMap = { 'dfs': dfsSteps, 'bfs': bfsSteps, 'addEdge': addEdgeSteps };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]() : dfsSteps();
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      }
    };

    const startRun = async (operation = 'dfs') => {
      if (runFlag) return;

      currentOperation = operation;
      if (opTypeRef && typeof opTypeRef === 'object' && 'value' in opTypeRef) {
        opTypeRef.value = operation;
      }
      runFlag = true;

      if (!currentIsAuto) {
        visited = new Array(pos.length).fill(false);
        highlighted = -1;
        highlighted2 = -1;
        msgText = '';
        stepQueue = [];
        drawGraph();

        const stepsMap = { 'dfs': dfsSteps, 'bfs': bfsSteps, 'addEdge': addEdgeSteps };
        const stepGenerator = stepsMap[operation] ? stepsMap[operation]() : dfsSteps();
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
        runFlag = false;
        return;
      }

      visited = new Array(pos.length).fill(false);
      highlighted = -1;
      highlighted2 = -1;
      msgText = '';
      drawGraph();

      const stepsMap = { 'dfs': dfsSteps, 'bfs': bfsSteps, 'addEdge': addEdgeSteps };
      const stepGenerator = stepsMap[operation] ? stepsMap[operation]() : dfsSteps();

      for (let step of stepGenerator) {
        if (!runFlag) break;

        visited = step.visited;
        highlighted = step.highlight;
        highlighted2 = step.highlight2;
        drawGraph();

        await new Promise(resolve => setTimeout(resolve, currentSpeed));
      }

      runFlag = false;
    };

    const nextStep = () => {
      if (stepQueue.length > 0) {
        const step = stepQueue.shift();
        visited = step.visited;
        highlighted = step.highlight;
        highlighted2 = step.highlight2;
        drawGraph();
      }
    };

    const setSpeed = (newSpeed) => { currentSpeed = newSpeed; };

    const setAuto = (auto) => {
      currentIsAuto = auto;

      if (!auto) {
        visited = new Array(pos.length).fill(false);
        highlighted = -1;
        highlighted2 = -1;
        msgText = '';
        stepQueue = [];
        drawGraph();

        const stepsMap = { 'dfs': dfsSteps, 'bfs': bfsSteps, 'addEdge': addEdgeSteps };
        const stepGenerator = stepsMap[currentOperation] ? stepsMap[currentOperation]() : dfsSteps();
        for (let step of stepGenerator) {
          stepQueue.push(step);
        }
      } else {
        stepQueue = [];
      }
    };

    const hasNextStep = () => stepQueue.length > 0;

    drawGraph();

    return {
      shuffleArr,
      resetAll,
      startRun,
      nextStep,
      setSpeed,
      setAuto,
      hasNextStep
    };
  }
};
