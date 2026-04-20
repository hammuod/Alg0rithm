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

<pre><span class="pl-c">/**</span>
<span class="pl-c"> * Finds the maximum value in an array of numbers.</span>
<span class="pl-c"> * <span class="pl-k">@param</span> {<span class="pl-smi">number[]</span>} arr - The array to search through.</span>
<span class="pl-c"> * <span class="pl-k">@returns</span> {<span class="pl-smi">number</span>} The largest number in the array.</span>
<span class="pl-c"> */</span>
<span class="pl-k">function</span> <span class="pl-en">findMaximum</span><span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
  <span class="pl-k">let</span> <span class="pl-s1">max</span> <span class="pl-c1">=</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-c1">0</span><span class="pl-kos">]</span><span class="pl-kos">;</span>

  <span class="pl-k">for</span> <span class="pl-kos">(</span><span class="pl-k">let</span> <span class="pl-s1">i</span> <span class="pl-c1">=</span> <span class="pl-c1">1</span><span class="pl-kos">;</span> <span class="pl-s1">i</span> <span class="pl-c1">&lt;</span> <span class="pl-s1">arr</span><span class="pl-kos">.</span><span class="pl-c1">length</span><span class="pl-kos">;</span> <span class="pl-s1">i</span><span class="pl-c1">++</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
    <span class="pl-k">if</span> <span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">i</span><span class="pl-kos">]</span> <span class="pl-c1">&gt;</span> <span class="pl-s1">max</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
      <span class="pl-s1">max</span> <span class="pl-c1">=</span> <span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">i</span><span class="pl-kos">]</span><span class="pl-kos">;</span>
    <span class="pl-kos">}</span>
  <span class="pl-kos">}</span>

  <span class="pl-k">return</span> <span class="pl-s1">max</span><span class="pl-kos">;</span>
<span class="pl-kos">}</span></pre>

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