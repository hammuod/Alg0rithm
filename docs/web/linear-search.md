# Linear Search Algorithm

## Introduction

Linear Search is the simplest searching algorithm. It works by going through each element in a list **one by one** from the beginning until it finds the target value — or reaches the end without finding it.

No sorting required. No tricks. Just check every element in order.

---

## What for?

- Searching through **small or unsorted arrays** where setting up a more complex algorithm isn't worth it.
- When you **can't sort** the data first (e.g., a live stream of values).
- As a fallback when the data structure doesn't support binary search.

---

## Code Block

<pre><span class="pl-c">/**</span>
<span class="pl-c"> * Searches for a target value in an array using Linear Search.</span>
<span class="pl-c"> * <span class="pl-k">@param</span> {<span class="pl-smi">number[]</span>} arr - The array to search through.</span>
<span class="pl-c"> * <span class="pl-k">@param</span> {<span class="pl-smi">number</span>} target - The value to find.</span>
<span class="pl-c"> * <span class="pl-k">@returns</span> {<span class="pl-smi">number</span>} The index of the target, or -1 if not found.</span>
<span class="pl-c"> */</span>
<span class="pl-k">function</span> <span class="pl-en">linearSearch</span><span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">,</span> <span class="pl-s1">target</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
  <span class="pl-k">for</span> <span class="pl-kos">(</span><span class="pl-k">let</span> <span class="pl-s1">i</span> <span class="pl-c1">=</span> <span class="pl-c1">0</span><span class="pl-kos">;</span> <span class="pl-s1">i</span> <span class="pl-c1">&lt;</span> <span class="pl-s1">arr</span><span class="pl-kos">.</span><span class="pl-c1">length</span><span class="pl-kos">;</span> <span class="pl-s1">i</span><span class="pl-c1">++</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
    <span class="pl-k">if</span> <span class="pl-kos">(</span><span class="pl-s1">arr</span><span class="pl-kos">[</span><span class="pl-s1">i</span><span class="pl-kos">]</span> <span class="pl-c1">===</span> <span class="pl-s1">target</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
      <span class="pl-k">return</span> <span class="pl-s1">i</span><span class="pl-kos">;</span>
    <span class="pl-kos">}</span>
  <span class="pl-kos">}</span>
  <span class="pl-k">return</span> <span class="pl-c1">-</span><span class="pl-c1">1</span><span class="pl-kos">;</span>
<span class="pl-kos">}</span></pre>

---

## Example

- **Input:** `[4, 2, 7, 1, 9, 3]`, target = `9`
- **Trace:** Check 4 ✗ → Check 2 ✗ → Check 7 ✗ → Check 1 ✗ → Check 9 ✓
- **Output:** `4` *(index of 9 in the array)*

---

## Complexity

| Case | Time Complexity |
|------|----------------|
| Best | O(1) — first element is the target |
| Worst | O(n) — target is last or not found |
| Average | O(n) |

**Space Complexity:** O(1) — no extra memory needed.