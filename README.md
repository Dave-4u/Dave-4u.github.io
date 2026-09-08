# Dave · Computer Science Portfolio

Personal portfolio site and showcase projects for [Dave-4u](https://github.com/Dave-4u).

**Live site:** https://Dave-4u.github.io/

## Layout

```
.
├── index.html              # Portfolio home
├── css/styles.css
├── js/main.js
└── projects/
    ├── pathfinding-visualizer/   # Dijkstra & A* interactive grid
    ├── mini-interpreter/         # Lexer → parser → AST → eval (Python)
    ├── concurrent-lru/           # Thread-safe LRU cache (Python)
    └── ds-playground/            # Min-heap & trie browser demo
```

## Local preview

From this directory:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/

Python projects can also be exercised directly:

```bash
cd projects/mini-interpreter && python demo.py && python -m unittest tests/test_interpreter.py -v
cd ../concurrent-lru && python demo.py && python -m unittest test_lru.py -v
```

## Enable GitHub Pages

1. Open the repository on GitHub: **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**
4. Save — the site will be published at https://Dave-4u.github.io/

## Projects

| Project | Stack | What it shows |
|---------|-------|----------------|
| Pathfinding Visualizer | HTML/CSS/JS | Dijkstra vs A*, wall painting, animated search |
| Miniature Interpreter | Python | Full language front-end with tests |
| Thread-Safe LRU Cache | Python | Concurrent O(1) cache, stress demo, tests |
| Heap & Trie Playground | HTML/CSS/JS | Live heap array/tree and trie autocomplete |
