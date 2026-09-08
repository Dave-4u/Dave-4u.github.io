(function () {
  var ROWS = 25;
  var COLS = 45;

  var gridEl = document.getElementById("grid");
  var algoEl = document.getElementById("algorithm");
  var speedEl = document.getElementById("speed");
  var visitedEl = document.getElementById("visited");
  var pathLenEl = document.getElementById("pathLen");
  var statusEl = document.getElementById("status");
  var runBtn = document.getElementById("run");
  var clearPathBtn = document.getElementById("clearPath");
  var clearWallsBtn = document.getElementById("clearWalls");
  var mazeBtn = document.getElementById("maze");

  var walls = new Set();
  var start = { r: 12, c: 8 };
  var goal = { r: 12, c: 36 };
  var cells = [];
  var running = false;
  var painting = false;
  var paintMode = true;

  function key(r, c) {
    return r + "," + c;
  }

  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }

  function isWall(r, c) {
    return walls.has(key(r, c));
  }

  function same(a, b) {
    return a.r === b.r && a.c === b.c;
  }

  function buildGrid() {
    gridEl.style.gridTemplateColumns = "repeat(" + COLS + ", 22px)";
    gridEl.innerHTML = "";
    cells = [];
    for (var r = 0; r < ROWS; r++) {
      cells[r] = [];
      for (var c = 0; c < COLS; c++) {
        var div = document.createElement("div");
        div.className = "cell";
        div.dataset.r = String(r);
        div.dataset.c = String(c);
        div.setAttribute("role", "gridcell");
        gridEl.appendChild(div);
        cells[r][c] = div;
      }
    }
    paintAll();
  }

  function paintAll() {
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var el = cells[r][c];
        el.className = "cell";
        if (isWall(r, c)) el.classList.add("wall");
        if (same(start, { r: r, c: c })) el.classList.add("start");
        if (same(goal, { r: r, c: c })) el.classList.add("goal");
      }
    }
  }

  function clearSearchVisuals() {
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var el = cells[r][c];
        el.classList.remove("visited", "frontier", "path");
      }
    }
    visitedEl.textContent = "0";
    pathLenEl.textContent = "—";
  }

  function neighbors(r, c) {
    var dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ];
    var out = [];
    for (var i = 0; i < dirs.length; i++) {
      var nr = r + dirs[i][0];
      var nc = c + dirs[i][1];
      if (inBounds(nr, nc) && !isWall(nr, nc)) out.push({ r: nr, c: nc });
    }
    return out;
  }

  function heuristic(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }

  function PriorityQueue() {
    this.items = [];
  }
  PriorityQueue.prototype.put = function (node, priority) {
    this.items.push({ node: node, priority: priority });
    this.items.sort(function (a, b) {
      return a.priority - b.priority;
    });
  };
  PriorityQueue.prototype.get = function () {
    return this.items.shift().node;
  };
  PriorityQueue.prototype.empty = function () {
    return this.items.length === 0;
  };

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function runSearch() {
    if (running) return;
    running = true;
    setControlsDisabled(true);
    clearSearchVisuals();
    statusEl.textContent = "Searching…";

    var useAstar = algoEl.value === "astar";
    var frontier = new PriorityQueue();
    frontier.put(start, 0);
    var cameFrom = {};
    var costSoFar = {};
    cameFrom[key(start.r, start.c)] = null;
    costSoFar[key(start.r, start.c)] = 0;

    var visitedCount = 0;
    var found = false;
    var delay = Math.max(1, 65 - Number(speedEl.value));

    while (!frontier.empty()) {
      var current = frontier.get();
      var ck = key(current.r, current.c);

      if (!same(current, start) && !same(current, goal)) {
        cells[current.r][current.c].classList.remove("frontier");
        cells[current.r][current.c].classList.add("visited");
      }
      visitedCount += 1;
      visitedEl.textContent = String(visitedCount);

      if (same(current, goal)) {
        found = true;
        break;
      }

      var neigh = neighbors(current.r, current.c);
      for (var i = 0; i < neigh.length; i++) {
        var next = neigh[i];
        var nk = key(next.r, next.c);
        var newCost = costSoFar[ck] + 1;
        if (!(nk in costSoFar) || newCost < costSoFar[nk]) {
          costSoFar[nk] = newCost;
          var priority = useAstar ? newCost + heuristic(next, goal) : newCost;
          frontier.put(next, priority);
          cameFrom[nk] = current;
          if (!same(next, start) && !same(next, goal)) {
            cells[next.r][next.c].classList.add("frontier");
          }
        }
      }

      await sleep(delay);
      if (!running) break;
    }

    if (found) {
      var path = [];
      var cur = goal;
      while (cur) {
        path.push(cur);
        var prev = cameFrom[key(cur.r, cur.c)];
        cur = prev;
      }
      path.reverse();
      for (var p = 0; p < path.length; p++) {
        var node = path[p];
        if (!same(node, start) && !same(node, goal)) {
          cells[node.r][node.c].classList.remove("visited", "frontier");
          cells[node.r][node.c].classList.add("path");
        }
        await sleep(18);
      }
      pathLenEl.textContent = String(path.length - 1);
      statusEl.textContent = "Path found";
    } else {
      statusEl.textContent = "No path";
      pathLenEl.textContent = "—";
    }

    running = false;
    setControlsDisabled(false);
  }

  function setControlsDisabled(disabled) {
    runBtn.disabled = disabled;
    clearPathBtn.disabled = disabled;
    clearWallsBtn.disabled = disabled;
    mazeBtn.disabled = disabled;
    algoEl.disabled = disabled;
  }

  function cellFromEvent(e) {
    var t = e.target;
    if (!t.classList || !t.classList.contains("cell")) return null;
    return { r: Number(t.dataset.r), c: Number(t.dataset.c) };
  }

  function toggleWallAt(r, c, force) {
    if (same(start, { r: r, c: c }) || same(goal, { r: r, c: c })) return;
    var k = key(r, c);
    var shouldWall = typeof force === "boolean" ? force : !walls.has(k);
    if (shouldWall) walls.add(k);
    else walls.delete(k);
    paintAll();
    clearSearchVisuals();
    statusEl.textContent = "Ready";
  }

  gridEl.addEventListener("mousedown", function (e) {
    if (running) return;
    var pos = cellFromEvent(e);
    if (!pos) return;
    e.preventDefault();

    if (e.shiftKey) {
      if (!isWall(pos.r, pos.c) && !same(goal, pos)) {
        start = pos;
        paintAll();
        clearSearchVisuals();
        statusEl.textContent = "Start moved";
      }
      return;
    }
    if (e.altKey) {
      if (!isWall(pos.r, pos.c) && !same(start, pos)) {
        goal = pos;
        paintAll();
        clearSearchVisuals();
        statusEl.textContent = "Goal moved";
      }
      return;
    }

    painting = true;
    paintMode = !isWall(pos.r, pos.c);
    toggleWallAt(pos.r, pos.c, paintMode);
  });

  gridEl.addEventListener("mouseover", function (e) {
    if (!painting || running) return;
    var pos = cellFromEvent(e);
    if (!pos) return;
    toggleWallAt(pos.r, pos.c, paintMode);
  });

  window.addEventListener("mouseup", function () {
    painting = false;
  });

  runBtn.addEventListener("click", function () {
    runSearch();
  });

  clearPathBtn.addEventListener("click", function () {
    if (running) return;
    clearSearchVisuals();
    statusEl.textContent = "Ready";
  });

  clearWallsBtn.addEventListener("click", function () {
    if (running) return;
    walls.clear();
    paintAll();
    clearSearchVisuals();
    statusEl.textContent = "Walls cleared";
  });

  mazeBtn.addEventListener("click", function () {
    if (running) return;
    walls.clear();
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (same(start, { r: r, c: c }) || same(goal, { r: r, c: c })) continue;
        if (Math.random() < 0.28) walls.add(key(r, c));
      }
    }
    paintAll();
    clearSearchVisuals();
    statusEl.textContent = "Random walls placed";
  });

  buildGrid();
})();
