# Thread-Safe LRU Cache

A concurrent least-recently-used (LRU) cache with:

- **O(1)** `get` / `put`
- Recency refresh on read
- Capacity-based eviction (oldest first)
- Hit / miss / eviction statistics
- Reentrant lock for safe multi-threaded use

## Quick start

```bash
cd projects/concurrent-lru
python demo.py
python -m unittest test_lru.py -v
```

## Usage

```python
from lru_cache import ConcurrentLRUCache

cache = ConcurrentLRUCache[str, dict](capacity=128)
cache.put("session:42", {"user": "dave"})
print(cache.get("session:42"))
print(cache.stats.hit_rate)
```

## Design

Internally this uses `OrderedDict`:

- Hash map semantics for lookup
- Move-to-end on access for LRU order
- `popitem(last=False)` to evict the oldest entry

A single `RLock` wraps mutations and lookups so length, eviction, and stats stay consistent under load. The stress demo (`demo.py`) launches several workers and reports throughput and hit rate.
