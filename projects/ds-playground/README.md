# Heap & Trie Playground

Browser demos of two classic structures:

1. **Binary min-heap** — insert / extract-min with array + level-order view
2. **Prefix trie** — insert words and run autocomplete over a shared prefix

## Run

From the repository root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/projects/ds-playground/`.

## Notes

- Heap operations maintain the min-heap invariant via sift-up / sift-down
- Trie nodes store child maps and an end-of-word flag; autocomplete is a bounded DFS from the prefix node
