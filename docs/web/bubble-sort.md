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

<pre><span class="pl-c">/**</span>
<span class="pl-c"> * Sorts an array of numbers in ascending order using Bubble Sort.</span>
<span class="pl-c"> * <span class="pl-k">@param</span> {<span class="pl-smi">number[]</span>} arr - The array to be sorted.</span>
<span class="pl-c"> * <span class="pl-k">@returns</span> {<span class="pl-smi">number[]</span>} The sorted array.</span>
<span class="pl-c"> */</span>
<span class="pl-k">function</span> <span class="pl-en">bubbleSort</span><span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
  <span class="pl-k">const</span> <span class="pl-s1">n</span> <span class="pl-c1">=</span> <span class="pl-s1">arr</span><span class="pl-kos">.</span><span class="pl-c1">length</span><span class="pl-kos">;</span>
  <span class="pl-k">let</span> <span class="pl-s1">swapped</span><span class="pl-kos">;</span>

  <span class="pl-k">for</span> <span class="pl-kos">(</span><span class="pl-k">let</span> <span class="pl-s1">i</span> <span class="pl-c1">=</span> <span class="pl-c1">0</span><span class="pl-kos">;</span> <span class="pl-s1">i</span> <span class="pl-c1">&lt;</span> <span class="pl-s1">n</span> <span class="pl-c1">-</span> <span class="pl-c1">1</span><span class="pl-kos">;</span> <span class="pl-s1">i</span><span class="pl-c1">++</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
    <span class="pl-s1">swapped</span> <span class="pl-c1">=</span> <span class="pl-c1">false</span><span class="pl-kos">;</span>

    <span class="pl-k">for</span> <span class="pl-kos">(</span><span class="pl-k">let</span> <span class="pl-s1">j</span> <span class="pl-c1">=</span> <span class="pl-c1">0</span><span class="pl-kos">;</span> <span class="pl-s1">j</span> <span class="pl-c1">&lt;</span> <span class="pl-s1">n</span> <span class="pl-c1">-</span> <span class="pl-c1">1</span> <span class="pl-c1">-</span> <span class="pl-s1">i</span><span class="pl-kos">;</span> <span class="pl-s1">j</span><span class="pl-c1">++</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
      <span class="pl-k">if</span> <span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">j</span><span class="pl-kos">]</span> <span class="pl-c1">&gt;</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">j</span> <span class="pl-c1">+</span> <span class="pl-c1">1</span><span class="pl-kos">]</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
        <span class="pl-kos">[</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">j</span><span class="pl-kos">]</span><span class="pl-kos">,</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">j</span> <span class="pl-c1">+</span> <span class="pl-c1">1</span><span class="pl-kos">]</span><span class="pl-kos">]</span> <span class="pl-c1">=</span> <span class="pl-kos">[</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">j</span> <span class="pl-c1">+</span> <span class="pl-c1">1</span><span class="pl-kos">]</span><span class="pl-kos">,</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">j</span><span class="pl-kos">]</span><span class="pl-kos">]</span><span class="pl-kos">;</span>
        <span class="pl-s1">swapped</span> <span class="pl-c1">=</span> <span class="pl-c1">true</span><span class="pl-kos">;</span>
      <span class="pl-kos">}</span>
    <span class="pl-kos">}</span>

    <span class="pl-k">if</span> <span class="pl-kos">(</span><span class="pl-c1">!</span><span class="pl-s1">swapped</span><span class="pl-kos">)</span> <span class="pl-k">break</span><span class="pl-kos">;</span>
  <span class="pl-kos">}</span>

  <span class="pl-k">return</span> <span class="pl-s1">arr</span><span class="pl-kos">;</span>
<span class="pl-kos">}</span></pre>

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