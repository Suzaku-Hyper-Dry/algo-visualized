window.DSCodeLibrary = {
  array: {
    access: {
      cpp: `// 数组随机访问 — O(1)
int access(int arr[], int index) {
    return arr[index];
}`,
      java: `// 数组随机访问 — O(1)
public static int access(int[] arr, int index) {
    return arr[index];
}`,
      python: `# 数组随机访问 — O(1)
def access(arr, index):
    return arr[index]`
    },
    insert: {
      cpp: `// 数组插入 — O(n)
void insert(int arr[], int& n, int index, int value) {
    for (int i = n; i > index; i--) {
        arr[i] = arr[i - 1];
    }
    arr[index] = value;
    n++;
}`,
      java: `// 数组插入 — O(n)
public static int[] insert(int[] arr, int index, int value) {
    int n = arr.length;
    int[] newArr = new int[n + 1];
    for (int i = 0; i < index; i++)
        newArr[i] = arr[i];
    newArr[index] = value;
    for (int i = index; i < n; i++)
        newArr[i + 1] = arr[i];
    return newArr;
}`,
      python: `# 数组插入 — O(n)
def insert(arr, index, value):
    arr.append(0)  # 扩容
    for i in range(len(arr) - 1, index, -1):
        arr[i] = arr[i - 1]
    arr[index] = value`
    },
    delete: {
      cpp: `// 数组删除 — O(n)
void remove(int arr[], int& n, int index) {
    for (int i = index; i < n - 1; i++) {
        arr[i] = arr[i + 1];
    }
    n--;
}`,
      java: `// 数组删除 — O(n)
public static int[] remove(int[] arr, int index) {
    int n = arr.length;
    int[] newArr = new int[n - 1];
    for (int i = 0; i < index; i++)
        newArr[i] = arr[i];
    for (int i = index; i < n - 1; i++)
        newArr[i] = arr[i + 1];
    return newArr;
}`,
      python: `# 数组删除 — O(n)
def remove(arr, index):
    for i in range(index, len(arr) - 1):
        arr[i] = arr[i + 1]
    arr.pop()`
    },
    search: {
      cpp: `// 线性搜索 — O(n)
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
      java: `// 线性搜索 — O(n)
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
      python: `# 线性搜索 — O(n)
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`
    }
  },
  linkedList: {
    traverse: {
      cpp: `// 链表遍历 — O(n)
void traverse(Node* head) {
    Node* cur = head;
    while (cur != nullptr) {
        cout << cur->data << " ";
        cur = cur->next;
    }
}`,
      java: `// 链表遍历 — O(n)
public void traverse(Node head) {
    Node cur = head;
    while (cur != null) {
        System.out.print(cur.data + " ");
        cur = cur.next;
    }
}`,
      python: `# 链表遍历 — O(n)
def traverse(head):
    cur = head
    while cur:
        print(cur.data, end=' ')
        cur = cur.next`
    },
    insert_head: {
      cpp: `// 链表头插 — O(1)
void insertHead(Node*& head, int value) {
    Node* newNode = new Node(value);
    newNode->next = head;
    head = newNode;
}`,
      java: `// 链表头插 — O(1)
public Node insertHead(Node head, int value) {
    Node newNode = new Node(value);
    newNode.next = head;
    return newNode;
}`,
      python: `# 链表头插 — O(1)
def insert_head(head, value):
    new_node = Node(value)
    new_node.next = head
    return new_node`
    },
    insert_tail: {
      cpp: `// 链表尾插 — O(n)
void insertTail(Node*& head, int value) {
    Node* newNode = new Node(value);
    if (head == nullptr) {
        head = newNode;
        return;
    }
    Node* cur = head;
    while (cur->next != nullptr)
        cur = cur->next;
    cur->next = newNode;
}`,
      java: `// 链表尾插 — O(n)
public void insertTail(Node head, int value) {
    Node newNode = new Node(value);
    if (head == null) return;
    Node cur = head;
    while (cur.next != null)
        cur = cur.next;
    cur.next = newNode;
}`,
      python: `# 链表尾插 — O(n)
def insert_tail(head, value):
    new_node = Node(value)
    if not head:
        return new_node
    cur = head
    while cur.next:
        cur = cur.next
    cur.next = new_node
    return head`
    },
    delete_head: {
      cpp: `// 链表头删 — O(1)
void deleteHead(Node*& head) {
    if (head == nullptr) return;
    Node* temp = head;
    head = head->next;
    delete temp;
}`,
      java: `// 链表头删 — O(1)
public Node deleteHead(Node head) {
    if (head == null) return null;
    return head.next;
}`,
      python: `# 链表头删 — O(1)
def delete_head(head):
    if not head:
        return None
    return head.next`
    },
    delete_tail: {
      cpp: `// 链表尾删 — O(n)
void deleteTail(Node*& head) {
    if (head == nullptr) return;
    if (head->next == nullptr) {
        delete head;
        head = nullptr;
        return;
    }
    Node* cur = head;
    while (cur->next->next != nullptr)
        cur = cur->next;
    delete cur->next;
    cur->next = nullptr;
}`,
      java: `// 链表尾删 — O(n)
public void deleteTail(Node head) {
    if (head == null || head.next == null)
        return;
    Node cur = head;
    while (cur.next.next != null)
        cur = cur.next;
    cur.next = null;
}`,
      python: `# 链表尾删 — O(n)
def delete_tail(head):
    if not head or not head.next:
        return None
    cur = head
    while cur.next.next:
        cur = cur.next
    cur.next = None
    return head`
    },
    search: {
      cpp: `// 链表搜索 — O(n)
int search(Node* head, int target) {
    Node* cur = head;
    int index = 0;
    while (cur != nullptr) {
        if (cur->data == target)
            return index;
        cur = cur->next;
        index++;
    }
    return -1;
}`,
      java: `// 链表搜索 — O(n)
public int search(Node head, int target) {
    Node cur = head;
    int index = 0;
    while (cur != null) {
        if (cur.data == target)
            return index;
        cur = cur.next;
        index++;
    }
    return -1;
}`,
      python: `# 链表搜索 — O(n)
def search(head, target):
    cur = head
    index = 0
    while cur:
        if cur.data == target:
            return index
        cur = cur.next
        index += 1
    return -1`
    }
  },
  stack: {
    push: {
      cpp: `// 栈 — push 入栈 O(1)
void push(int stack[], int& top, int value, int capacity) {
    if (top >= capacity) return;  // 栈满
    stack[++top] = value;
}`,
      java: `// 栈 — push 入栈 O(1)
public void push(int[] stack, int top, int value) {
    if (top >= stack.length - 1) return;
    stack[++top] = value;
}`,
      python: `# 栈 — push 入栈 O(1)
def push(stack, value):
    stack.append(value)`
    },
    pop: {
      cpp: `// 栈 — pop 出栈 O(1)
int pop(int stack[], int& top) {
    if (top < 0) return -1;  // 栈空
    return stack[top--];
}`,
      java: `// 栈 — pop 出栈 O(1)
public int pop(int[] stack, int top) {
    if (top < 0) return -1;
    return stack[top--];
}`,
      python: `# 栈 — pop 出栈 O(1)
def pop(stack):
    if not stack:
        return None
    return stack.pop()`
    },
    peek: {
      cpp: `// 栈 — peek 查看栈顶 O(1)
int peek(int stack[], int top) {
    if (top < 0) return -1;
    return stack[top];
}`,
      java: `// 栈 — peek 查看栈顶 O(1)
public int peek(int[] stack, int top) {
    if (top < 0) return -1;
    return stack[top];
}`,
      python: `# 栈 — peek 查看栈顶 O(1)
def peek(stack):
    if not stack:
        return None
    return stack[-1]`
    }
  },
  queue: {
    enqueue: {
      cpp: `// 队列 — enqueue 入队 O(1)
void enqueue(int queue[], int& rear, int value, int capacity) {
    if (rear >= capacity) return;  // 队满
    queue[rear++] = value;
}`,
      java: `// 队列 — enqueue 入队 O(1)
public void enqueue(int[] queue, int rear, int value) {
    if (rear >= queue.length) return;
    queue[rear++] = value;
}`,
      python: `# 队列 — enqueue 入队 O(1)
def enqueue(queue, value):
    queue.append(value)`
    },
    dequeue: {
      cpp: `// 队列 — dequeue 出队 O(n)
int dequeue(int queue[], int& front, int rear) {
    if (front >= rear) return -1;  // 队空
    return queue[front++];
}`,
      java: `// 队列 — dequeue 出队 O(n)
public int dequeue(int[] queue, int front, int rear) {
    if (front >= rear) return -1;
    return queue[front++];
}`,
      python: `# 队列 — dequeue 出队 O(n)
def dequeue(queue):
    if not queue:
        return None
    return queue.pop(0)`
    },
    peek: {
      cpp: `// 队列 — peek 查看队首 O(1)
int peek(int queue[], int front, int rear) {
    if (front >= rear) return -1;
    return queue[front];
}`,
      java: `// 队列 — peek 查看队首 O(1)
public int peek(int[] queue, int front, int rear) {
    if (front >= rear) return -1;
    return queue[front];
}`,
      python: `# 队列 — peek 查看队首 O(1)
def peek(queue):
    if not queue:
        return None
    return queue[0]`
    }
  },
  tree: {
    insert: {
      cpp: `// 树 — 插入子节点 O(1)
void insertChild(TreeNode* parent, int value) {
    TreeNode* child = new TreeNode(value);
    parent->children.push_back(child);
}`,
      java: `// 树 — 插入子节点 O(1)
public void insertChild(TreeNode parent, int value) {
    TreeNode child = new TreeNode(value);
    parent.children.add(child);
}`,
      python: `# 树 — 插入子节点 O(1)
def insert_child(parent, value):
    child = TreeNode(value)
    parent.children.append(child)`
    },
    traverse: {
      cpp: `// 树 — 先序遍历 O(n)
void preorder(TreeNode* root) {
    if (root == nullptr) return;
    cout << root->val << " ";
    for (auto child : root->children)
        preorder(child);
}`,
      java: `// 树 — 先序遍历 O(n)
public void preorder(TreeNode root) {
    if (root == null) return;
    System.out.print(root.val + " ");
    for (TreeNode child : root.children)
        preorder(child);
}`,
      python: `# 树 — 先序遍历 O(n)
def preorder(root):
    if not root:
        return
    print(root.val, end=' ')
    for child in root.children:
        preorder(child)`
    },
    search: {
      cpp: `// 树 — DFS 搜索 O(n)
TreeNode* search(TreeNode* root, int target) {
    if (root == nullptr) return nullptr;
    if (root->val == target) return root;
    for (auto child : root->children) {
        TreeNode* found = search(child, target);
        if (found != nullptr) return found;
    }
    return nullptr;
}`,
      java: `// 树 — DFS 搜索 O(n)
public TreeNode search(TreeNode root, int target) {
    if (root == null) return null;
    if (root.val == target) return root;
    for (TreeNode child : root.children) {
        TreeNode found = search(child, target);
        if (found != null) return found;
    }
    return null;
}`,
      python: `# 树 — DFS 搜索 O(n)
def search(root, target):
    if not root:
        return None
    if root.val == target:
        return root
    for child in root.children:
        found = search(child, target)
        if found:
            return found
    return None`
    }
  },
  binaryTree: {
    insert: {
      cpp: `// 二叉搜索树 — 插入 O(log n) 平均
TreeNode* insert(TreeNode* root, int value) {
    if (root == nullptr) return new TreeNode(value);
    if (value < root->val)
        root->left = insert(root->left, value);
    else
        root->right = insert(root->right, value);
    return root;
}`,
      java: `// 二叉搜索树 — 插入 O(log n) 平均
public TreeNode insert(TreeNode root, int value) {
    if (root == null) return new TreeNode(value);
    if (value < root.val)
        root.left = insert(root.left, value);
    else
        root.right = insert(root.right, value);
    return root;
}`,
      python: `# 二叉搜索树 — 插入 O(log n) 平均
def insert(root, value):
    if not root:
        return TreeNode(value)
    if value < root.val:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)
    return root`
    },
    preorder: {
      cpp: `// 二叉树 — 先序遍历 O(n)
void preorder(TreeNode* root) {
    if (root == nullptr) return;
    cout << root->val << " ";
    preorder(root->left);
    preorder(root->right);
}`,
      java: `// 二叉树 — 先序遍历 O(n)
public void preorder(TreeNode root) {
    if (root == null) return;
    System.out.print(root.val + " ");
    preorder(root.left);
    preorder(root.right);
}`,
      python: `# 二叉树 — 先序遍历 O(n)
def preorder(root):
    if not root:
        return
    print(root.val, end=' ')
    preorder(root.left)
    preorder(root.right)`
    },
    inorder: {
      cpp: `// 二叉树 — 中序遍历 O(n)
void inorder(TreeNode* root) {
    if (root == nullptr) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}`,
      java: `// 二叉树 — 中序遍历 O(n)
public void inorder(TreeNode root) {
    if (root == null) return;
    inorder(root.left);
    System.out.print(root.val + " ");
    inorder(root.right);
}`,
      python: `# 二叉树 — 中序遍历 O(n)
def inorder(root):
    if not root:
        return
    inorder(root.left)
    print(root.val, end=' ')
    inorder(root.right)`
    },
    postorder: {
      cpp: `// 二叉树 — 后序遍历 O(n)
void postorder(TreeNode* root) {
    if (root == nullptr) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";
}`,
      java: `// 二叉树 — 后序遍历 O(n)
public void postorder(TreeNode root) {
    if (root == null) return;
    postorder(root.left);
    postorder(root.right);
    System.out.print(root.val + " ");
}`,
      python: `# 二叉树 — 后序遍历 O(n)
def postorder(root):
    if not root:
        return
    postorder(root.left)
    postorder(root.right)
    print(root.val, end=' ')`
    },
    search: {
      cpp: `// 二叉搜索树 — 查找 O(log n) 平均
TreeNode* search(TreeNode* root, int target) {
    if (root == nullptr || root->val == target)
        return root;
    if (target < root->val)
        return search(root->left, target);
    return search(root->right, target);
}`,
      java: `// 二叉搜索树 — 查找 O(log n) 平均
public TreeNode search(TreeNode root, int target) {
    if (root == null || root.val == target)
        return root;
    if (target < root.val)
        return search(root.left, target);
    return search(root.right, target);
}`,
      python: `# 二叉搜索树 — 查找 O(log n) 平均
def search(root, target):
    if not root or root.val == target:
        return root
    if target < root.val:
        return search(root.left, target)
    return search(root.right, target)`
    }
  },
  graph: {
    addEdge: {
      cpp: `// 图 — 添加边（邻接表）O(1)
void addEdge(vector<int> adj[], int u, int v) {
    adj[u].push_back(v);
    adj[v].push_back(u);  // 无向图
}`,
      java: `// 图 — 添加边（邻接表）O(1)
public void addEdge(List<Integer>[] adj, int u, int v) {
    adj[u].add(v);
    adj[v].add(u);  // 无向图
}`,
      python: `# 图 — 添加边（邻接表）O(1)
def add_edge(adj, u, v):
    adj[u].append(v)
    adj[v].append(u)  # 无向图`
    },
    dfs: {
      cpp: `// 图 — DFS 深度优先遍历 O(V+E)
void dfs(int u, vector<int> adj[], vector<bool>& visited) {
    visited[u] = true;
    cout << u << " ";
    for (int v : adj[u])
        if (!visited[v]) dfs(v, adj, visited);
}`,
      java: `// 图 — DFS 深度优先遍历 O(V+E)
public void dfs(int u, List<Integer>[] adj, boolean[] visited) {
    visited[u] = true;
    System.out.print(u + " ");
    for (int v : adj[u])
        if (!visited[v]) dfs(v, adj, visited);
}`,
      python: `# 图 — DFS 深度优先遍历 O(V+E)
def dfs(u, adj, visited):
    visited[u] = True
    print(u, end=' ')
    for v in adj[u]:
        if not visited[v]:
            dfs(v, adj, visited)`
    },
    bfs: {
      cpp: `// 图 — BFS 广度优先遍历 O(V+E)
void bfs(int start, vector<int> adj[], int n) {
    vector<bool> visited(n, false);
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        for (int v : adj[u])
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
    }
}`,
      java: `// 图 — BFS 广度优先遍历 O(V+E)
public void bfs(int start, List<Integer>[] adj, int n) {
    boolean[] visited = new boolean[n];
    Queue<Integer> queue = new LinkedList<>();
    queue.add(start);
    visited[start] = true;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        System.out.print(u + " ");
        for (int v : adj[u])
            if (!visited[v]) {
                visited[v] = true;
                queue.add(v);
            }
    }
}`,
      python: `# 图 — BFS 广度优先遍历 O(V+E)
from collections import deque

def bfs(start, adj, n):
    visited = [False] * n
    q = deque([start])
    visited[start] = True
    while q:
        u = q.popleft()
        print(u, end=' ')
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                q.append(v)`
    }
  }
};
