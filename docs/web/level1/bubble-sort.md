Selection Sort Algorithm
========================

Introduction
------------
Selection Sort is a simple comparison-based sorting algorithm. It works by 
dividing the input list into two parts: a sorted sublist and an unsorted sublist. 
The algorithm repeatedly finds the minimum element from the unsorted part 
and moves it to the beginning.



What for?
---------
- Sorting small arrays where memory is limited.
- Situations where the cost of swapping is high (Selection Sort minimizes swaps).

Code Block
----------

```js
Sorts an array of numbers in ascending order using Bubble Sort.
 @param {number[]} arr - The array to be sorted.
 @returns {number[]} The sorted array.
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

- **Input:** ``[1, 3, 4, 5, 2, 6, 7, 8, 9, 4]``
- **Trace:** It finds the smallest number (1), then the next smallest (2), and places them in order.
- **Output:** ``[1, 2, 3, 4, 4, 5, 6, 7, 8, 9]``