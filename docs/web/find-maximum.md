# Find Maximum Algorithm

## Introduction

Find Maximum is a simple traversal algorithm. It works by going through each
element in an array while keeping track of the **largest value seen so far**.
By the end of the loop, that value is the maximum.

---

## What for?

- Finding the highest score, temperature, price, or any numeric peak in a dataset.
- As a building block inside other algorithms (e.g., Selection Sort uses it every pass).
- Validating input ranges or detecting outliers.

---

## Code Block

```js
/**
 * Finds the maximum value in an array of numbers.
 * @param {number[]} arr - The array to search through.
 * @returns {number} The largest number in the array.
 */
function findMaximum(arr) {
  let max = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }

  return max;
}
```

---

## Example

- **Input:** `[3, 7, 1, 9, 4, 6]`
- **Trace:**
  - Start: `max = 3`
  - Compare `7 > 3` ✓ → `max = 7`
  - Compare `1 > 7` ✗ → `max = 7`
  - Compare `9 > 7` ✓ → `max = 9`
  - Compare `4 > 9` ✗ → `max = 9`
  - Compare `6 > 9` ✗ → `max = 9`
- **Output:** `9`

---

## Complexity

| Case    | Time Complexity                        |
| ------- | -------------------------------------- |
| Best    | O(n) — must check every element        |
| Worst   | O(n)                                   |
| Average | O(n)                                   |

**Space Complexity:** O(1) — only one extra variable (`max`) regardless of array size.