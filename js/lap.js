let bars, nums, isPaused = false, history = [], currentStepIndex = -1, currentAbortController = null, currentAlgoKey = '1';
let NUM_SLEEP = 1000;
const algosData = {
    '1': [38, 27, 43, 3, 9, 82, 10],
    '2': [64, 25, 12, 22, 11, 90, 45],
    '3': [12, 11, 13, 5, 6, 7, 42],
    '4': [38, 27, 43, 3, 9, 82, 10],
    '5': [38, 27, 43, 3, 9, 82, 10],
    '6': [38, 27, 43, 3, 9, 82, 10],
    '7': [4, 2, 2, 8, 3, 3, 1],
    'b1': [1, 7, 24, 39, 40, 45, 89],
    'b2': [2, 3, 22, 29, 38, 40, 84],
    'b3': [4, 7, 30, 37, 40, 55, 92],
    'b4': [2, 5, 64, 57, 68, 79, 95]
};
const primary = "#6B7280", blue = "#4A90E2", green = "#4ade80", red = "#f87171", yellow = "#fbbf24";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const btnPlay = document.querySelector('.btns');
const btnStop = document.querySelector('.btnp');
const btnNext = document.querySelector('.btnR');
const btnPrev = document.querySelector('.btnL');
const iconPlay = btnPlay?.querySelector('i');


btnPlay?.addEventListener('click', () => {
    isPaused = !isPaused;
    if (iconPlay) iconPlay.className = isPaused ? "fa-solid fa-play" : "fa-solid fa-pause";
});
btnStop?.addEventListener('click', () => {
    start(currentAlgoKey);
});
btnNext?.addEventListener('click', (e) => {
    e.currentTarget.blur(); 
    if (currentStepIndex < history.length - 1) {
        isPaused = true;
        if (iconPlay) iconPlay.className = "fa-solid fa-play";
        render(++currentStepIndex, currentAlgoKey);
    }
});
btnPrev?.addEventListener('click', (e) => {
    e.currentTarget.blur();
    if (currentStepIndex > 0) {
        isPaused = true;
        if (iconPlay) iconPlay.className = "fa-solid fa-play";
        render(--currentStepIndex, currentAlgoKey);
    }
});

function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            recordSnapshot(arr, [j, j + 1], Array.from({length: i}, (_, k) => arr.length - 1 - k), 'compare');
            if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; recordSnapshot(arr, [j, j + 1], Array.from({length: i}, (_, k) => arr.length - 1 - k), 'swap'); }
        }
    }
}
function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        recordSnapshot(arr, 'compare'); 
        let min = i;
        for (let j = i + 1; j < arr.length; j++) {
            recordSnapshot(arr, [j], [min], 'compare'); 
            if (arr[j] < arr[min]) min = j;
        }
        [arr[i], arr[min]] = [arr[min], arr[i]]; 
        recordSnapshot(arr, [i, min], [], 'swap');
    }
}
function insertionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let temp = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > temp) {
            recordSnapshot(arr, [j, j + 1], Array.from({length: i}, (_, k) => k), 'compare');
            arr[j + 1] = arr[j]; recordSnapshot(arr, [j, j + 1], Array.from({length: i}, (_, k) => k), 'swap');
            j--;
        }
        arr[j + 1] = temp; recordSnapshot(arr, [j + 1], Array.from({length: i + 1}, (_, k) => k), 'swap');
    }
}
function quickSort(arr, l, h, sorted = []) {
    if (l >= h) { if(l === h) sorted.push(l); return; }
    let p = arr[h], i = l - 1;
    recordSnapshot(arr, [h], [...sorted], 'pivot'); 
    for (let j = l; j < h; j++) {
        recordSnapshot(arr, [j, h], [...sorted], 'compare');
        if (arr[j] < p) { 
            i++; 
            [arr[i], arr[j]] = [arr[j], arr[i]]; 
            recordSnapshot(arr, [i, j], [...sorted], 'swap'); 
        }
    }
    [arr[i + 1], arr[h]] = [arr[h], arr[i + 1]]; 
    sorted.push(i + 1);
    recordSnapshot(arr, [i + 1, h], [...sorted], 'swap');
    quickSort(arr, l, i, sorted); quickSort(arr, i + 2, h, sorted);
}
function mergeSort(arr, l, r) {
    if (l >= r) return;
    let m = Math.floor((l + r) / 2);
    mergeSort(arr, l, m); mergeSort(arr, m + 1, r);
    let left = arr.slice(l, m + 1), right = arr.slice(m + 1, r + 1), i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
        recordSnapshot(arr, [k], [], 'compare');
        arr[k] = (left[i] <= right[j]) ? left[i++] : right[j++]; recordSnapshot(arr, [k], [], 'swap'); k++;
    }
    while (i < left.length) { arr[k] = left[i++]; recordSnapshot(arr, [k], [], 'swap'); k++; }
    while (j < right.length) { arr[k] = right[j++]; recordSnapshot(arr, [k], [], 'swap'); k++; }
}
function heapSort(arr) {
    const heapify = (n, i, s) => {
        let largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;
        if (largest !== i) { [arr[i], arr[largest]] = [arr[largest], arr[i]]; recordSnapshot(arr, [i, largest], [...s], 'swap'); heapify(n, largest, s); }
    };
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr.length, i, []);
    let sorted = [];
    for (let i = arr.length - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]]; sorted.push(i);
        recordSnapshot(arr, [0, i], [...sorted], 'swap');
        heapify(i, 0, sorted);
    }
    sorted.push(0); recordSnapshot(arr, [], [...sorted], 'end');
}
function shellSort(arr) {
    for (let g = Math.floor(arr.length / 2); g > 0; g = Math.floor(g / 2)) {
        for (let i = g; i < arr.length; i++) {
            let j = i;
            while (j >= g && arr[j] < arr[j - g]) { recordSnapshot(arr, [j, j - g], [], 'compare'); [arr[j], arr[j - g]] = [arr[j - g], arr[j]]; recordSnapshot(arr, [j, j - g], [], 'swap'); j -= g; }
        }
    }
}
function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        recordSnapshot(arr, [mid], [], 'pivot'); 
        if (arr[mid] === target) { recordSnapshot(arr, [mid], [], 'found'); return; }
        if (arr[mid] < target) low = mid + 1; else high = mid - 1;
    }
}
function jumpSearch(arr, target) {
    let n = arr.length, step = Math.floor(Math.sqrt(n)), prev = 0;
    while (arr[Math.min(step, n) - 1] < target) { recordSnapshot(arr, [Math.min(step, n) - 1], [], 'compare'); prev = step; step += Math.floor(Math.sqrt(n)); if (prev >= n) return; }
    while (arr[prev] < target) { recordSnapshot(arr, [prev], [], 'compare'); prev++; if (prev === Math.min(step, n)) return; }
    if (arr[prev] === target) recordSnapshot(arr, [prev], [], 'found');
}
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) { recordSnapshot(arr, [i], [], 'found'); return; }
        recordSnapshot(arr, [i], [], 'compare');
    }
}
function interpolationSearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        let pos = low + Math.floor(((high - low) / (arr[high] - arr[low])) * (target - arr[low]));
        recordSnapshot(arr, [pos], [], 'compare');
        if (arr[pos] === target) { recordSnapshot(arr, [pos], [], 'found'); return; }
        if (arr[pos] < target) low = pos + 1; else high = pos - 1;
    }
}


function recordSnapshot(arr, activeIndices = [], sortedIndices = [], type = 'normal') {
    history.push({ values: [...arr], active: [...activeIndices], sorted: [...sortedIndices], type });
}
function generateSteps(key) {
    history = []; let arr = [...algosData[key]];
    if (key === '1') bubbleSort(arr);
    else if (key === '2') selectionSort(arr);
    else if (key === '3') insertionSort(arr);
    else if (key === '4') quickSort(arr, 0, arr.length - 1);
    else if (key === '5') mergeSort(arr, 0, arr.length - 1);
    else if (key === '6') heapSort(arr);
    else if (key === '7') shellSort(arr);
    else if (key === 'b1') binarySearch(arr, 40);
    else if (key === 'b2') jumpSearch(arr, 38);
    else if (key === 'b3') interpolationSearch(arr, 30);
    else if (key === 'b4') linearSearch(arr, 95);
    if (!key.startsWith('b')) recordSnapshot(arr, [], Array.from({length: arr.length}, (_,k) => k), 'end');
}
function render(idx, key) {
    if (idx < 0 || idx >= history.length) return;
    const s = history[idx];
    const scale = 300 / Math.max(...algosData[key]);
    bars.forEach((b, i) => {
        b.style.height = (s.values[i] * scale) + "px";
        nums[i].innerText = s.values[i];
        b.style.opacity = "1";
        if (s.type === 'found') {
            if (s.active.includes(i)) { 
                b.style.backgroundColor = green; 
                nums[i].style.color = green; 
            } else {
                b.style.opacity = "0.3";
            }
        } else if (s.sorted.includes(i)) {
            b.style.backgroundColor = green; 
            nums[i].style.color = green;
        } else if (s.active.includes(i)) {
            b.style.backgroundColor = (s.type === 'swap') ? red : (s.type === 'pivot' ? yellow : blue);
        } else {
            b.style.backgroundColor = primary; 
            nums[i].style.color = primary;
        }
        if (btnPrev) btnPrev.disabled = (idx === 0);
        if (btnNext) btnNext.disabled = (idx === history.length - 1);
    });
}
async function start(k) {
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;
    currentAlgoKey = k;
    const newData = algosData[k];
    const container = document.querySelector('.container');
    container.innerHTML = newData.map(v => `<div class="bar-wrapper"><div class="num">${v}</div><div class="rec"></div></div>`).join('');
    bars = document.querySelectorAll('.rec'); 
    nums = document.querySelectorAll('.num');
    generateSteps(k); 
    currentStepIndex = 0;
    render(0, k);
    isPaused = true; 
    if (iconPlay) iconPlay.className = "fa-solid fa-play";
    try {        
        while (currentStepIndex < history.length) {
            if (signal.aborted) return;
            while (isPaused) { 
                if (signal.aborted) return; 
                await sleep(100); 
            }
            render(currentStepIndex, k); 
            await sleep(NUM_SLEEP); 
            currentStepIndex++;
        }
    } catch (e) {}
}
window.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        btnPlay.click();
    }
    if (e.key === "ArrowRight") btnNext.click();
    if (e.key === "ArrowLeft") btnPrev.click();
});
window.addEventListener('DOMContentLoaded', () => {
    const p = window.location.search;
    const id = p.startsWith('?=') ? p.split('=')[1] : '1';
    if (algosData[id]) start(id);
});