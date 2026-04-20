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

<pre><span class="pl-c">/**</span>
<span class="pl-c"> * Sorts an array of numbers in ascending order using Selection Sort.</span>
<span class="pl-c"> * <span class="pl-k">@param</span> {<span class="pl-smi">number[]</span>} arr - The array to be sorted.</span>
<span class="pl-c"> * <span class="pl-k">@returns</span> {<span class="pl-smi">number[]</span>} The sorted array.</span>
<span class="pl-c"> */</span>
<span class="pl-k">function</span> <span class="pl-en">selectionSort</span><span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
  <span class="pl-k">const</span> <span class="pl-s1">n</span> <span class="pl-c1">=</span> <span class="pl-s1">arr</span><span class="pl-kos">.</span><span class="pl-c1">length</span><span class="pl-kos">;</span>

  <span class="pl-k">for</span> <span class="pl-kos">(</span><span class="pl-k">let</span> <span class="pl-s1">i</span> <span class="pl-c1">=</span> <span class="pl-c1">0</span><span class="pl-kos">;</span> <span class="pl-s1">i</span> <span class="pl-c1">&lt;</span> <span class="pl-s1">n</span> <span class="pl-c1">-</span> <span class="pl-c1">1</span><span class="pl-kos">;</span> <span class="pl-s1">i</span><span class="pl-c1">++</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
    <span class="pl-k">let</span> <span class="pl-s1">minIndex</span> <span class="pl-c1">=</span> <span class="pl-s1">i</span><span class="pl-kos">;</span>

    <span class="pl-k">for</span> <span class="pl-kos">(</span><span class="pl-k">let</span> <span class="pl-s1">j</span> <span class="pl-c1">=</span> <span class="pl-s1">i</span> <span class="pl-c1">+</span> <span class="pl-c1">1</span><span class="pl-kos">;</span> <span class="pl-s1">j</span> <span class="pl-c1">&lt;</span> <span class="pl-s1">n</span><span class="pl-kos">;</span> <span class="pl-s1">j</span><span class="pl-c1">++</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
      <span class="pl-k">if</span> <span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">j</span><span class="pl-kos">]</span> <span class="pl-c1">&lt;</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">minIndex</span><span class="pl-kos">]</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
        <span class="pl-s1">minIndex</span> <span class="pl-c1">=</span> <span class="pl-s1">j</span><span class="pl-kos">;</span>
      <span class="pl-kos">}</span>
    <span class="pl-kos">}</span>

    <span class="pl-k">if</span> <span class="pl-kos">(</span><span class="pl-s1">minIndex</span> <span class="pl-c1">!==</span> <span class="pl-s1">i</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
      <span class="pl-kos">[</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">i</span><span class="pl-kos">]</span><span class="pl-kos">,</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">minIndex</span><span class="pl-kos">]</span><span class="pl-kos">]</span> <span class="pl-c1">=</span> <span class="pl-kos">[</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">minIndex</span><span class="pl-kos">]</span><span class="pl-kos">,</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">i</span><span class="pl-kos">]</span><span class="pl-kos">]</span><span class="pl-kos">;</span>
    <span class="pl-kos">}</span>
  <span class="pl-kos">}</span>

  <span class="pl-k">return</span> <span class="pl-s1">arr</span><span class="pl-kos">;</span>
<span class="pl-kos">}</span></pre>

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