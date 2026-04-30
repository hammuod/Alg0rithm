const primary = "#6B7280", blue = "#4A90E2", green = "#4ade80", red = "#f87171", orange = "#fb923c", yellow = "#fbbf24";
let bars, nums, isPaused = false, history = [], currentStepIndex = -1, currentAbortController = null;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const algosData = {
    '1': [38, 27, 43, 3, 9, 82, 10],
    '2': [64, 25, 12, 22, 11, 90, 45],
    '3': [12, 11, 13, 5, 6, 7, 42],
    '4': [38, 27, 43, 3, 9, 82, 10],
    '5': [38, 27, 43, 3, 9, 82, 10],
    '6': [38, 27, 43, 3, 9, 82, 10],
    '7': [4, 2, 2, 8, 3, 3, 1],
    '8': [4, 2, 2, 8, 3, 3, 1],
    '9': [170, 45, 75, 90, 802, 24, 2]
};

function recordSnapshot(arr, activeIndices = [], type = 'normal') {
    history.push({ values: [...arr], active: [...activeIndices], type });
}

function bubbleSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            recordSnapshot(arr, [j, j+1], 'compare');
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                recordSnapshot(arr, [j, j+1], 'swap');
            }
        }
    }
}

function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let min = i;
        for (let j = i + 1; j < arr.length; j++) {
            recordSnapshot(arr, [j, min], 'compare');
            if (arr[j] < arr[min]) {
                min = j;
                recordSnapshot(arr, [min], 'minFound');
            }
        }
        [arr[i], arr[min]] = [arr[min], arr[i]];
        recordSnapshot(arr, [i, min], 'swap');
    }
}

function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let j = i;
        while (j > 0 && arr[j] < arr[j - 1]) {
            recordSnapshot(arr, [j, j - 1], 'compare');
            [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
            recordSnapshot(arr, [j, j - 1], 'swap');
            j--;
        }
    }
}

function quickSort(arr, l, h) {
    if (l >= h) return;
    let p = arr[h], i = l - 1;
    recordSnapshot(arr, [h], 'pivot');
    for (let j = l; j < h; j++) {
        recordSnapshot(arr, [j, h], 'compare');
        if (arr[j] < p) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            recordSnapshot(arr, [i, j], 'swap');
        }
    }
    [arr[i + 1], arr[h]] = [arr[h], arr[i + 1]];
    recordSnapshot(arr, [i + 1, h], 'swap');
    quickSort(arr, l, i);
    quickSort(arr, i + 2, h);
}

function mergeSort(arr, l, r) {
    if (l >= r) return;
    let m = Math.floor((l + r) / 2);
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    let left = arr.slice(l, m + 1), right = arr.slice(m + 1, r + 1), i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
        recordSnapshot(arr, [k], 'compare');
        arr[k] = (left[i] <= right[j]) ? left[i++] : right[j++];
        recordSnapshot(arr, [k], 'swap');
        k++;
    }
    while (i < left.length) { arr[k] = left[i++]; recordSnapshot(arr, [k], 'swap'); k++; }
    while (j < right.length) { arr[k] = right[j++]; recordSnapshot(arr, [k], 'swap'); k++; }
}

function heapSort(arr) {
    const heapify = (size, idx) => {
        let largest = idx, l = 2 * idx + 1, r = 2 * idx + 2;
        if (l < size && arr[l] > arr[largest]) largest = l;
        if (r < size && arr[r] > arr[largest]) largest = r;
        if (largest !== idx) {
            [arr[idx], arr[largest]] = [arr[largest], arr[idx]];
            recordSnapshot(arr, [idx, largest], 'swap');
            heapify(size, largest);
        }
    };
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr.length, i);
    for (let i = arr.length - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        recordSnapshot(arr, [0, i], 'swap');
        heapify(i, 0);
    }
}

function countingSort(arr) {
    let max = Math.max(...arr), count = new Array(max + 1).fill(0);
    for (let x of arr) { recordSnapshot(arr, [], 'compare'); count[x]++; }
    let k = 0;
    for (let i = 0; i <= max; i++) {
        while (count[i]-- > 0) {
            arr[k] = i;
            recordSnapshot(arr, [k], 'swap');
            k++;
        }
    }
}

function shellSort(arr) {
    for (let g = Math.floor(arr.length/2); g > 0; g = Math.floor(g/2)) {
        for (let i = g; i < arr.length; i++) {
            let j = i;
            while (j >= g && arr[j] < arr[j-g]) {
                recordSnapshot(arr, [j, j-g], 'compare');
                [arr[j], arr[j-g]] = [arr[j-g], arr[j]];
                recordSnapshot(arr, [j, j-g], 'swap');
                j -= g;
            }
        }
    }
}

function generateSteps(key) {
    history = [];
    let arr = [...algosData[key]];
    recordSnapshot(arr, [], 'start');
    if (key === '1') bubbleSort(arr);
    else if (key === '2') selectionSort(arr);
    else if (key === '3') insertionSort(arr);
    else if (key === '4') quickSort(arr, 0, arr.length - 1);
    else if (key === '5') mergeSort(arr, 0, arr.length - 1);
    else if (key === '6') heapSort(arr);
    else if (key === '7' || key === '8') countingSort(arr);
    else if (key === '9') shellSort(arr);
    recordSnapshot(arr, [], 'end');
}

function render(idx, k) {
    if (idx < 0 || idx >= history.length) return;
    const s = history[idx];
    bars.forEach((b, i) => {
        let hMult = (k === '9' ? 0.3 : (k === '7' || k === '8' ? 30 : 3));
        b.style.height = (s.values[i] * hMult) + "px";
        nums[i].innerText = s.values[i];
        if (s.active.includes(i)) {
            if (s.type === 'swap') b.style.backgroundColor = red;
            else if (s.type === 'pivot') b.style.backgroundColor = yellow;
            else if (s.type === 'minFound') b.style.backgroundColor = orange;
            else b.style.backgroundColor = blue;
        } else if (s.type === 'end') {
            b.style.backgroundColor = green;
            nums[i].style.color = green;
        } else {
            b.style.backgroundColor = primary;
            nums[i].style.color = primary;
        }
    });
}

async function start(k) {
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    bars = document.querySelectorAll('.rec'); nums = document.querySelectorAll('.num');
    generateSteps(k); currentStepIndex = 0; isPaused = false;
    try {
        while (currentStepIndex < history.length) {
            if (isPaused) { await sleep(100); continue; }
            render(currentStepIndex, k); await sleep(600); currentStepIndex++;
        }
    } catch (e) {}
}

window.addEventListener('keydown', (e) => {
    if (algosData[e.key]) start(e.key);
    if (e.code === "Space") isPaused = !isPaused;
    if (e.key === "ArrowRight" && currentStepIndex < history.length - 1) render(++currentStepIndex, "1");
    if (e.key === "ArrowLeft" && currentStepIndex > 0) render(--currentStepIndex, "1");
});

document.addEventListener('DOMContentLoaded', () => start('1'));