"""Thread-safe LRU cache with O(1) get/put.

Uses a hash map for lookups and a doubly linked list for recency order.
A single reentrant lock protects structural mutations; reads and writes
are serialized for correctness under concurrent access.
"""

from __future__ import annotations

from collections import OrderedDict
from dataclasses import dataclass
from threading import RLock
from typing import Generic, Hashable, TypeVar

K = TypeVar("K", bound=Hashable)
V = TypeVar("V")


@dataclass
class CacheStats:
    hits: int = 0
    misses: int = 0
    inserts: int = 0
    evictions: int = 0

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total else 0.0


class ConcurrentLRUCache(Generic[K, V]):
    def __init__(self, capacity: int) -> None:
        if capacity < 1:
            raise ValueError("capacity must be >= 1")
        self._capacity = capacity
        self._data: OrderedDict[K, V] = OrderedDict()
        self._lock = RLock()
        self.stats = CacheStats()

    @property
    def capacity(self) -> int:
        return self._capacity

    def __len__(self) -> int:
        with self._lock:
            return len(self._data)

    def get(self, key: K) -> V | None:
        with self._lock:
            if key not in self._data:
                self.stats.misses += 1
                return None
            self._data.move_to_end(key)
            self.stats.hits += 1
            return self._data[key]

    def put(self, key: K, value: V) -> None:
        with self._lock:
            if key in self._data:
                self._data.move_to_end(key)
                self._data[key] = value
                return
            self._data[key] = value
            self.stats.inserts += 1
            if len(self._data) > self._capacity:
                self._data.popitem(last=False)
                self.stats.evictions += 1

    def contains(self, key: K) -> bool:
        with self._lock:
            return key in self._data

    def clear(self) -> None:
        with self._lock:
            self._data.clear()

    def snapshot(self) -> list[tuple[K, V]]:
        """Oldest → newest order."""
        with self._lock:
            return list(self._data.items())
