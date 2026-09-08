import threading
import unittest

from lru_cache import ConcurrentLRUCache


class LRUTests(unittest.TestCase):
    def test_eviction_order(self):
        cache = ConcurrentLRUCache[int, str](2)
        cache.put(1, "a")
        cache.put(2, "b")
        cache.put(3, "c")
        self.assertIsNone(cache.get(1))
        self.assertEqual(cache.get(2), "b")
        self.assertEqual(cache.get(3), "c")
        self.assertEqual(cache.stats.evictions, 1)

    def test_get_refreshes_recency(self):
        cache = ConcurrentLRUCache[int, str](2)
        cache.put(1, "a")
        cache.put(2, "b")
        self.assertEqual(cache.get(1), "a")
        cache.put(3, "c")
        self.assertIsNone(cache.get(2))
        self.assertEqual(cache.get(1), "a")

    def test_capacity_validation(self):
        with self.assertRaises(ValueError):
            ConcurrentLRUCache(0)

    def test_concurrent_puts_and_gets(self):
        cache = ConcurrentLRUCache[int, int](64)
        errors: list[BaseException] = []

        def worker(start: int) -> None:
            try:
                for i in range(start, start + 200):
                    cache.put(i % 80, i)
                    cache.get(i % 80)
            except BaseException as exc:  # noqa: BLE001
                errors.append(exc)

        threads = [threading.Thread(target=worker, args=(n * 50,)) for n in range(8)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(errors, [])
        self.assertLessEqual(len(cache), cache.capacity)
        self.assertGreater(cache.stats.hits + cache.stats.misses, 0)


if __name__ == "__main__":
    unittest.main()
