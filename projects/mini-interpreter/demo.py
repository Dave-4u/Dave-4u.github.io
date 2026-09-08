#!/usr/bin/env python3
"""Run a short sample program through the mini interpreter."""

from src.interpreter import interpret

SOURCE = """
radius = 5;
area = 3.14159 * radius ^ 2;
perimeter = 2 * 3.14159 * radius;
area;
perimeter;
"""

if __name__ == "__main__":
    print("Source:")
    print(SOURCE.strip())
    print("\nResults:")
    for value in interpret(SOURCE):
        if value is not None:
            print(value)
