# Selection Sort Algorithm

## Introduction

Selection Sort is a simple comparison-based sorting algorithm. It works by
dividing the input list into two parts: a **sorted sublist** and an **unsorted sublist**.
The algorithm repeatedly finds the minimum element from the unsorted part
and moves it to the beginning.

---

## What for?

- Sorting small arrays where memory is limited.
- Situations where the cost of swapping is high (Selection Sort minimizes swaps).

---

## Code Block

```js
/**
 * Sorts an array of numbers in ascending order using Selection Sort.
 * @param {number[]} arr - The array to be sorted.
 * @returns {number[]} The sorted array.
 */
function selectionSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }

  return arr;
}
```

---

## Example

- **Input:** `[5, 3, 1, 4, 2]`
- **Trace:**
  - Pass 1: Find min in `[5, 3, 1, 4, 2]` → `1` at index 2 → swap with index 0 → `[1, 3, 5, 4, 2]`
  - Pass 2: Find min in `[3, 5, 4, 2]` → `2` at index 4 → swap with index 1 → `[1, 2, 5, 4, 3]`
  - Pass 3: Find min in `[5, 4, 3]` → `3` at index 4 → swap with index 2 → `[1, 2, 3, 4, 5]`
  - Pass 4: Find min in `[4, 5]` → already in place → no swap
- **Output:** `[1, 2, 3, 4, 5]`

---

## Complexity

| Case    | Time Complexity                          |
| ------- | ---------------------------------------- |
| Best    | O(n²) — always scans the full unsorted part |
| Worst   | O(n²)                                    |
| Average | O(n²)                                    |

**Space Complexity:** O(1) — sorts in-place, no extra memory needed.