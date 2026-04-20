# Bubble Sort Algorithm

## Introduction

Bubble Sort is a simple comparison-based sorting algorithm. It works by
repeatedly stepping through the array and **swapping adjacent elements**
that are in the wrong order. Each full pass "bubbles" the largest unsorted
element to its correct position at the end.

---

## What for?

- Learning and understanding how sorting works at a fundamental level.
- Sorting very small arrays where simplicity matters more than performance.
- Detecting nearly-sorted arrays quickly (with the early-exit optimization).

---

## Code Block

```js
/**
 * Sorts an array of numbers in ascending order using Bubble Sort.
 * @param {number[]} arr - The array to be sorted.
 * @returns {number[]} The sorted array.
 */
function bubbleSort(arr) {
  const n = arr.length;
  let swapped;

  for (let i = 0; i < n - 1; i++) {
    swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return arr;
}
```

---

## Example

- **Input:** `[5, 3, 8, 1, 4]`
- **Trace:**
  - Pass 1: `[3, 5, 1, 4, 8]` — 8 bubbles to the end
  - Pass 2: `[3, 1, 4, 5, 8]` — 5 bubbles to its place
  - Pass 3: `[1, 3, 4, 5, 8]` — 3 bubbles to its place
  - Pass 4: No swaps → early exit ✓
- **Output:** `[1, 3, 4, 5, 8]`

---

## Complexity

| Case    | Time Complexity                              |
| ------- | -------------------------------------------- |
| Best    | O(n) — array already sorted, early exit kicks in |
| Worst   | O(n²) — array sorted in reverse              |
| Average | O(n²)                                        |

**Space Complexity:** O(1) — sorts in-place, no extra memory needed.