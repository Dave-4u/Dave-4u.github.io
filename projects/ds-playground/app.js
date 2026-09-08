(function () {
  function MinHeap() {
    this.data = [];
  }

  MinHeap.prototype.insert = function (value) {
    this.data.push(value);
    this._siftUp(this.data.length - 1);
  };

  MinHeap.prototype.extractMin = function () {
    if (this.data.length === 0) return null;
    var min = this.data[0];
    var last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return min;
  };

  MinHeap.prototype._siftUp = function (i) {
    while (i > 0) {
      var parent = Math.floor((i - 1) / 2);
      if (this.data[parent] <= this.data[i]) break;
      var tmp = this.data[parent];
      this.data[parent] = this.data[i];
      this.data[i] = tmp;
      i = parent;
    }
  };

  MinHeap.prototype._siftDown = function (i) {
    var n = this.data.length;
    while (true) {
      var left = 2 * i + 1;
      var right = 2 * i + 2;
      var smallest = i;
      if (left < n && this.data[left] < this.data[smallest]) smallest = left;
      if (right < n && this.data[right] < this.data[smallest]) smallest = right;
      if (smallest === i) break;
      var tmp = this.data[i];
      this.data[i] = this.data[smallest];
      this.data[smallest] = tmp;
      i = smallest;
    }
  };

  MinHeap.prototype.toTreeString = function () {
    if (this.data.length === 0) return "(empty)";
    var lines = [];
    var level = 0;
    var index = 0;
    while (index < this.data.length) {
      var count = Math.pow(2, level);
      var slice = this.data.slice(index, index + count);
      lines.push(slice.join("   "));
      index += count;
      level += 1;
    }
    return lines.join("\n");
  };

  function TrieNode() {
    this.children = {};
    this.end = false;
  }

  function Trie() {
    this.root = new TrieNode();
  }

  Trie.prototype.insert = function (word) {
    var node = this.root;
    var w = word.toLowerCase();
    for (var i = 0; i < w.length; i++) {
      var ch = w[i];
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.end = true;
  };

  Trie.prototype.autocomplete = function (prefix, limit) {
    limit = limit || 8;
    var node = this.root;
    var p = prefix.toLowerCase();
    for (var i = 0; i < p.length; i++) {
      if (!node.children[p[i]]) return [];
      node = node.children[p[i]];
    }
    var results = [];
    function dfs(n, path) {
      if (results.length >= limit) return;
      if (n.end) results.push(path);
      var keys = Object.keys(n.children).sort();
      for (var k = 0; k < keys.length; k++) {
        dfs(n.children[keys[k]], path + keys[k]);
        if (results.length >= limit) return;
      }
    }
    dfs(node, p);
    return results;
  };

  Trie.prototype.toString = function () {
    var lines = [];
    function walk(node, prefix, indent) {
      var keys = Object.keys(node.children).sort();
      for (var i = 0; i < keys.length; i++) {
        var ch = keys[i];
        var child = node.children[ch];
        var mark = child.end ? "*" : "";
        lines.push(indent + ch + mark);
        walk(child, prefix + ch, indent + "  ");
      }
    }
    walk(this.root, "", "");
    return lines.length ? lines.join("\n") : "(empty)";
  };

  var heap = new MinHeap();
  var trie = new Trie();

  var heapInput = document.getElementById("heapInput");
  var heapArray = document.getElementById("heapArray");
  var heapTree = document.getElementById("heapTree");
  var trieInput = document.getElementById("trieInput");
  var trieView = document.getElementById("trieView");
  var trieSuggestOut = document.getElementById("trieSuggestOut");

  function renderHeap() {
    heapArray.textContent = JSON.stringify(heap.data);
    heapTree.textContent = heap.toTreeString();
  }

  function renderTrie() {
    trieView.textContent = trie.toString();
  }

  document.getElementById("heapInsert").addEventListener("click", function () {
    var raw = heapInput.value.trim();
    if (raw === "" || Number.isNaN(Number(raw))) return;
    heap.insert(Number(raw));
    heapInput.value = "";
    renderHeap();
  });

  document.getElementById("heapExtract").addEventListener("click", function () {
    heap.extractMin();
    renderHeap();
  });

  document.getElementById("heapClear").addEventListener("click", function () {
    heap.data = [];
    renderHeap();
  });

  document.getElementById("trieInsert").addEventListener("click", function () {
    var word = trieInput.value.trim();
    if (!/^[a-zA-Z]+$/.test(word)) return;
    trie.insert(word);
    trieInput.value = "";
    renderTrie();
  });

  document.getElementById("trieSuggest").addEventListener("click", function () {
    var prefix = trieInput.value.trim();
    var suggestions = trie.autocomplete(prefix);
    trieSuggestOut.textContent = suggestions.length ? suggestions.join(", ") : "(none)";
  });

  document.getElementById("trieClear").addEventListener("click", function () {
    trie = new Trie();
    trieSuggestOut.textContent = "—";
    renderTrie();
  });

  ["code", "cat", "cart", "dog", "dart", "data", "delta"].forEach(function (w) {
    trie.insert(w);
  });
  [9, 4, 7, 1, 8, 2].forEach(function (n) {
    heap.insert(n);
  });
  renderHeap();
  renderTrie();
})();
