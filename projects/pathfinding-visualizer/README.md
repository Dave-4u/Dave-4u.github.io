# Pathfinding Visualizer

Interactive grid demo of **Dijkstra** and **A\*** pathfinding.

## Features

- Switch between Dijkstra (uniform cost) and A* (Manhattan heuristic)
- Paint / erase walls by dragging
- Move start with Shift+click, goal with Alt+click
- Animate visited cells, frontier, and final path
- Adjustable animation speed and random wall generation

## Run locally

From the repository root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/projects/pathfinding-visualizer/`.

Or open `index.html` directly in a browser.

## Implementation notes

- Grid graph with 4-directional movement and unit edge weights
- Priority queue expands lowest `g` (Dijkstra) or `g + h` (A*)
- Visualization is decoupled from the search core so timing can change without altering correctness
