#!/usr/bin/env python3
"""Stress demo: many threads hammer a small LRU and report hit rate."""

from __future__ import annotations

import random
import threading
import time

from lru_cache import ConcurrentLRUCache


def run_demo(capacity: int = 32, workers: int = 8, ops_per_worker: int = 5000) -> None:
    cache: ConcurrentLRUCache[int, int] = ConcurrentLRUCache(capacity)
    barrier = threading.Barrier(workers)

    def worker(seed: int) -> None:
        rng = random.Random(seed)
        barrier.wait()
        for _ in range(ops_per_worker):
            key = rng.randint(0, capacity * 3)
            if rng.random() < 0.7:
                cache.get(key)
            else:
                cache.put(key, key * key)

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(workers)]
    start = time.perf_counter()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    elapsed = time.perf_counter() - start

    total_ops = workers * ops_per_worker
    print(f"capacity={capacity} workers={workers} ops={total_ops}")
    print(f"elapsed={elapsed:.3f}s  throughput={total_ops / elapsed:,.0f} ops/s")
    print(f"size={len(cache)}/{cache.capacity}")
    print(
        f"hits={cache.stats.hits} misses={cache.stats.misses} "
        f"hit_rate={cache.stats.hit_rate:.1%} "
        f"evictions={cache.stats.evictions}"
    )
    print("snapshot (oldest → newest), last 8 entries:")
    snap = cache.snapshot()[-8:]
    print(snap)


if __name__ == "__main__":
    run_demo()
