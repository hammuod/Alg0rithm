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
    '8': [42, 32, 33, 52, 37, 47, 51],
    '9': [170, 45, 75, 90, 802, 24, 2, 66],
    'b1': [1, 7, 24, 39, 40, 45, 89],
    'b2': [2, 3, 22, 29, 38, 40, 84],
    'b3': [4, 7, 30, 37, 40, 55, 92],
    'b4': [2, 5, 64, 57, 68, 79, 95],
    'a1': [5, 2, 8, 1, 9, 3, 7],
    'a2': [3, 7, 1, 9, 4, 2, 6],
    'a3': [1, 2, 3, 5, 7, 9, 12],
    'a4': [2, 5, 1, 8, 2, 9, 1],
    'a5': [1, 4, 7, 2, 5, 8],
    'a6': [3, 1, 4, 1, 5, 9, 3],
    'a7': [4, 2, 4, 7, 2, 9, 4],
    'a8': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
};
const primary = "#6B7280", blue = "#4A90E2", green = "#4ade80", red = "#f87171", yellow = "#fbbf24";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const btnPlay = document.querySelector('.btns');
const btnStop = document.querySelector('.btnp');
const btnNext = document.querySelector('.btnR');
const btnPrev = document.querySelector('.btnL');
const iconPlay = btnPlay?.querySelector('i');

const currentPath = window.location.pathname;

if (localStorage.getItem('transitioning') === 'start') {
    const curtain = document.createElement('div');
    curtain.classList.add('curtain');
    curtain.style.transition = 'none';
    curtain.classList.add('active');
    document.body.appendChild(curtain);

    setTimeout(() => {
        curtain.style.transition = 'all 0.5s ease';
        curtain.classList.remove('active');
        curtain.classList.add('exit');
        
        setTimeout(() => {
            curtain.remove();
            localStorage.removeItem('transitioning');
        }, 500); 
    }, 100); 
}

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
        const targetHref = link.href;
        
        try {
            const targetUrl = new URL(targetHref);
            const isSamePage = targetUrl.pathname === currentPath;
            const isAnchor = targetHref.includes('#');

            if (targetHref && !isSamePage && !isAnchor && targetUrl.origin === window.location.origin) {
                e.preventDefault();
                localStorage.setItem('transitioning', 'start');
                
                const curtain = document.createElement('div');
                curtain.classList.add('curtain');
                document.body.appendChild(curtain);

                setTimeout(() => {
                    curtain.classList.add('active');
                    setTimeout(() => {
                        window.location.href = targetHref;
                    }, 500);
                }, 50);
            }
        } catch (err) {
            return;
        }
    });
});

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

const themeBtn = document.getElementById('dark-mode-toggle');
if (themeBtn) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
    themeBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };
}

const speedInput = document.getElementById('speed');
const speedVal = document.getElementById('speed-val');
if (speedInput) {
    speedInput.addEventListener('input', () => {
        NUM_SLEEP = Number(speedInput.value);
        if (speedVal) speedVal.innerText = (NUM_SLEEP / 1000).toFixed(1) + 's';
    });
}

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
        recordSnapshot(arr, [], [], 'compare'); 
        let min = i;
        for (let j = i + 1; j < arr.length; j++) {
            recordSnapshot(arr, [j], [min], 'compare'); 
            if (arr[j] < arr[min]) min = j;
        }
        [arr[i], arr[min]] = [arr[min], arr[i]]; 
        recordSnapshot(arr, [i, min], [], 'swap');
        recordSnapshot(arr, [], Array.from({length: i + 1}, (_, k) => k), 'normal');
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
        recordSnapshot(arr, [k], [], 'compare', `Comparing ${left[i]} and ${right[j]}`);
        arr[k] = (left[i] <= right[j]) ? left[i++] : right[j++]; recordSnapshot(arr, [k], [], 'swap'); k++;
    }
    while (i < left.length) { arr[k] = left[i++]; recordSnapshot(arr, [k], [], 'swap'); k++; }
    while (j < right.length) { arr[k] = right[j++]; recordSnapshot(arr, [k], [], 'swap'); k++; }
    recordSnapshot(arr, [], Array.from({length: r - l + 1}, (_, x) => l + x), 'normal');
}
function heapSort(arr) {
    const heapify = (n, i, s) => {
        let largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && arr[l] > arr[largest]) { recordSnapshot(arr, [l, largest], [...s], 'compare'); largest = l; }
        if (r < n && arr[r] > arr[largest]) { recordSnapshot(arr, [r, largest], [...s], 'compare'); largest = r; }
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
        recordSnapshot(arr, [mid], [], 'compare'); 
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
        if (arr[high] === arr[low]) {
            if (arr[low] === target) { recordSnapshot(arr, [low], [], 'found'); }
            return;
        }
        let pos = low + Math.floor(((high - low) / (arr[high] - arr[low])) * (target - arr[low]));
        if (Number.isNaN(pos) || pos < low || pos > high) return;
        recordSnapshot(arr, [pos], [], 'compare');
        if (arr[pos] === target) { recordSnapshot(arr, [pos], [], 'found'); return; }
        if (arr[pos] < target) low = pos + 1; else high = pos - 1;
    }
}


function bucketSort(arr) {
    const n = arr.length, min = Math.min(...arr), max = Math.max(...arr);
    const buckets = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) {
        const bi = Math.floor(((arr[i] - min) / (max - min + 1)) * n);
        buckets[bi].push(arr[i]);
        recordSnapshot(arr, [i], [], 'compare', `Placing ${arr[i]} into bucket ${bi}`);
    }
    let k = 0;
    for (let b = 0; b < buckets.length; b++) {
        buckets[b].sort((a, c) => a - c);
        for (const val of buckets[b]) {
            arr[k] = val;
            recordSnapshot(arr, [k], Array.from({ length: k + 1 }, (_, x) => x), 'swap', `Bucket ${b}: placing ${val}`);
            k++;
        }
    }
}
function radixSort(arr) {
    const max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        const out = new Array(arr.length).fill(0);
        const count = new Array(10).fill(0);
        for (let i = 0; i < arr.length; i++) {
            const d = Math.floor(arr[i] / exp) % 10;
            count[d]++;
            recordSnapshot(arr, [i], [], 'compare', `Digit ${d} of ${arr[i]} (place value ${exp})`);
        }
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];
        for (let i = arr.length - 1; i >= 0; i--) {
            const d = Math.floor(arr[i] / exp) % 10;
            out[--count[d]] = arr[i];
        }
        for (let i = 0; i < arr.length; i++) {
            arr[i] = out[i];
            recordSnapshot(arr, [i], Array.from({ length: i + 1 }, (_, x) => x), 'swap', `Rebuilt order by place ${exp}`);
        }
    }
}
function arrayTraversing(arr) {
    for (let i = 0; i < arr.length; i++) {
        recordSnapshot(arr, [i], Array.from({ length: i }, (_, k) => k), 'visit', `Visiting ${arr[i]}`);
    }
    recordSnapshot(arr, [], Array.from({ length: arr.length }, (_, k) => k), 'normal', 'Array traversed');
}
function findMaxMin(arr) {
    let max = 0, min = 0;
    for (let i = 0; i < arr.length; i++) {
        recordSnapshot(arr, [i], [], 'compare', `Checking ${arr[i]} against current max/min`);
        if (arr[i] > arr[max]) max = i;
        if (arr[i] < arr[min]) min = i;
    }
    recordSnapshot(arr, [max, min], [], 'found', `Max is ${arr[max]} and Min is ${arr[min]}`);
}
function twoPointers(arr, target) {
    let l = 0, r = arr.length - 1;
    while (l < r) {
        recordSnapshot(arr, [l, r], [], 'compare', `Checking ${arr[l]} + ${arr[r]} = ${arr[l] + arr[r]}`);
        const s = arr[l] + arr[r];
        if (s === target) { recordSnapshot(arr, [l, r], [], 'found', `Pair found: ${arr[l]} + ${arr[r]} = ${target}`); return; }
        if (s < target) l++; else r--;
    }
    recordSnapshot(arr, [], [], 'normal', `No pair sums to ${target}`);
}
function slidingWindow(arr, k) {
    let win = arr.slice(0, k).reduce((a, b) => a + b, 0);
    let maxSum = win, bestStart = 0;
    recordSnapshot(arr, Array.from({ length: k }, (_, i) => i), [], 'compare', `Initial window sum = ${win}`);
    for (let i = k; i < arr.length; i++) {
        win = win + arr[i] - arr[i - k];
        recordSnapshot(arr, Array.from({ length: k }, (_, j) => i - k + 1 + j), [], 'compare', `Window sum = ${win}`);
        if (win > maxSum) { maxSum = win; bestStart = i - k + 1; }
    }
    recordSnapshot(arr, Array.from({ length: k }, (_, j) => bestStart + j), [], 'found', `Max sum ${maxSum} (window starting at index ${bestStart})`);
}
function mergeArrays(arr) {
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid), right = arr.slice(mid);
    let i = 0, j = 0, k = 0;
    while (i < left.length && j < right.length) {
        recordSnapshot(arr, [k], [], 'compare', `Comparing ${left[i]} and ${right[j]}`);
        arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
        recordSnapshot(arr, [k - 1], [], 'swap', `Placed ${arr[k - 1]}`);
    }
    while (i < left.length) { arr[k] = left[i]; recordSnapshot(arr, [k], [], 'swap', `Placing ${left[i]}`); k++; i++; }
    while (j < right.length) { arr[k] = right[j]; recordSnapshot(arr, [k], [], 'swap', `Placing ${right[j]}`); k++; j++; }
    recordSnapshot(arr, [], Array.from({ length: arr.length }, (_, x) => x), 'normal', 'Arrays merged and sorted');
}
function frequencyCounter(arr) {
    const count = {};
    for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        count[v] = (count[v] || 0) + 1;
        recordSnapshot(arr, [i], [], 'compare', `Value ${v} appears ${count[v]} time(s)`);
    }
    for (let i = 0; i < arr.length; i++) arr[i] = count[arr[i]];
    recordSnapshot(arr, [], Array.from({ length: arr.length }, (_, k) => k), 'normal', 'Histogram: bar height = frequency of its value');
}
function removeDuplicates(arr) {
    const seen = new Set();
    for (let i = 0; i < arr.length; i++) {
        if (seen.has(arr[i])) {
            recordSnapshot(arr, [i], [], 'swap', `${arr[i]} is a duplicate — marked for removal`);
        } else {
            seen.add(arr[i]);
            recordSnapshot(arr, [i], [], 'compare', `${arr[i]} seen for the first time`);
        }
    }
    const distinct = arr.filter((v, i) => arr.indexOf(v) === i);
    for (let i = 0; i < arr.length; i++) arr[i] = distinct[i] !== undefined ? distinct[i] : 0;
    recordSnapshot(arr, [], Array.from({ length: distinct.length }, (_, k) => k), 'normal', `Without duplicates: ${distinct.join(', ')}`);
}
function sieveOfEratosthenes(arr) {
    const n = arr.length - 1;
    const prime = new Array(arr.length).fill(true);
    prime[0] = prime[1] = false;
    for (let i = 0; i <= 1; i++) recordSnapshot(arr, [i], [], 'compare', `${i} is not prime`);
    for (let p = 2; p * p <= n; p++) {
        if (prime[p]) {
            recordSnapshot(arr, [p], [], 'compare', `${p} is prime — striking its multiples`);
            for (let m = p * p; m <= n; m += p) {
                prime[m] = false;
                recordSnapshot(arr, [m], [], 'swap', `Striking out ${m} (multiple of ${p})`);
            }
        }
    }
    const primes = [];
    for (let i = 2; i <= n; i++) if (prime[i]) primes.push(i);
    recordSnapshot(arr, primes, [], 'found', `Primes up to ${n}: ${primes.join(', ')}`);
}
let comparisons = 0, swapCount = 0;
function snapshotDesc(arr, activeIndices, sortedIndices, type) {
    const v = (i) => arr[i];
    if (type === 'end') return 'Array is sorted!';
    if (type === 'visit') return activeIndices.length ? `Visiting ${v(activeIndices[0])}` : 'Starting traversal';
    if (type === 'swap') return activeIndices.length >= 2 ? `Swapping ${v(activeIndices[0])} and ${v(activeIndices[1])}` : `Placing ${v(activeIndices[0])}`;
    if (type === 'pivot') return activeIndices.length ? `Pivot is ${v(activeIndices[0])}` : 'Picking pivot';
    if (type === 'found') return activeIndices.length ? `Found ${v(activeIndices[0])}!` : 'Element not found';
    if (type === 'compare') {
        if (activeIndices.length >= 2) return `Comparing ${v(activeIndices[0])} and ${v(activeIndices[1])}`;
        if (activeIndices.length === 1) return `Comparing ${v(activeIndices[0])} with target`;
        return 'Starting new pass';
    }
    return sortedIndices.length ? `Marking ${sortedIndices.length} elements as sorted` : 'Ready';
}
function recordSnapshot(arr, activeIndices = [], sortedIndices = [], type = 'normal', desc = null) {
    if (type === 'compare') comparisons++;
    if (type === 'swap') swapCount++;
    history.push({ values: [...arr], active: [...activeIndices], sorted: [...sortedIndices], type, desc: desc || snapshotDesc(arr, activeIndices, sortedIndices, type), comps: comparisons, swaps: swapCount });
}
function generateSteps(key) {
    history = []; comparisons = 0; swapCount = 0; let arr = [...algosData[key]];
    if (key === '1') bubbleSort(arr);
    else if (key === '2') selectionSort(arr);
    else if (key === '3') insertionSort(arr);
    else if (key === '4') quickSort(arr, 0, arr.length - 1);
    else if (key === '5') mergeSort(arr, 0, arr.length - 1);
    else if (key === '6') heapSort(arr);
    else if (key === '7') shellSort(arr);
    else if (key === '8') bucketSort(arr);
    else if (key === '9') radixSort(arr);
    else if (key === 'b1') binarySearch(arr, 40);
    else if (key === 'b2') jumpSearch(arr, 38);
    else if (key === 'b3') interpolationSearch(arr, 30);
    else if (key === 'b4') linearSearch(arr, 95);
    else if (key === 'a1') arrayTraversing(arr);
    else if (key === 'a2') findMaxMin(arr);
    else if (key === 'a3') twoPointers(arr, 10);
    else if (key === 'a4') slidingWindow(arr, 3);
    else if (key === 'a5') mergeArrays(arr);
    else if (key === 'a6') frequencyCounter(arr);
    else if (key === 'a7') removeDuplicates(arr);
    else if (key === 'a8') sieveOfEratosthenes(arr);
    if (/^[0-9]$/.test(key)) recordSnapshot(arr, [], Array.from({ length: arr.length }, (_, k) => k), 'end');
}
function render(idx, key) {
    if (idx < 0 || idx >= history.length) return;
    const s = history[idx];
    const actionText = document.getElementById('actionText');
    const countComp = document.getElementById('countComp');
    const countSwap = document.getElementById('countSwap');
    if (actionText) actionText.innerHTML = `<span class="step-word">Step ${idx + 1}:</span> ${s.desc}`;
    if (countComp) countComp.textContent = s.comps;
    if (countSwap) countSwap.textContent = s.swaps;
    const maxVal = Math.max(...history.map(h => Math.max(...h.values)));
    const scale = 300 / maxVal;
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
            const c = (s.type === 'swap') ? red : (s.type === 'pivot' ? yellow : blue);
            b.style.backgroundColor = c;
            nums[i].style.color = c;
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
    let step = 1;
    try {        
        while (step < history.length) {
            if (signal.aborted) return;
            while (isPaused) { 
                if (signal.aborted) return; 
                await sleep(100); 
            }
            currentStepIndex = step;
            render(step, k); 
            await sleep(NUM_SLEEP); 
            step++;
        }
        currentStepIndex = history.length - 1;
    } catch (e) {}
}
window.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        btnPlay.click();
    }
    if (e.key === "ArrowRight") btnNext.click();
    if (e.key === "ArrowLeft") btnPrev.click();
    if (e.key === "Escape") document.body.classList.remove('docs-sidebar-open');
});

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('docs-sidebar-open');
    });
}

if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
        document.body.classList.remove('docs-sidebar-open');
    });
}

document.querySelectorAll('#docsSidebar a').forEach(link => {
    link.addEventListener('click', () => document.body.classList.remove('docs-sidebar-open'));
});
window.addEventListener('DOMContentLoaded', () => {
    const p = window.location.search;
    const id = p.startsWith('?=') ? p.split('=')[1] : '1';
    if (algosData[id]) start(id);
});

