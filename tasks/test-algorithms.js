// Test 3: Algorithm logic tests for js/lap.js (run via node vm sandbox)
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('js/lap.js', 'utf8');

const noop = () => {};
const fakeEl = () => ({
  addEventListener: noop,
  querySelector: () => null,
  style: {},
  classList: { add: noop, remove: noop, toggle: noop },
  innerText: '',
  setAttribute: noop,
});
const documentStub = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: () => fakeEl(),
  body: { appendChild: noop, classList: { add: noop, remove: noop } },
  addEventListener: noop,
};
const sandbox = {
  document: documentStub,
  window: { addEventListener: noop, location: { pathname: '/lap.html', search: '', origin: 'http://x' }, scrollY: 0 },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  navigator: {},
  console,
  setTimeout,
  clearTimeout,
  Math, Array, Number, Object, Promise, String,
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const isSorted = a => a.every((v, i) => i === 0 || a[i - 1] <= v);
let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log('  PASS', name); } else { fail++; console.log('  FAIL', name); } };

// module-level const/let bindings live in the script scope, not on the global
// object; use runInContext to read/reset them.
const ctxGet = name => vm.runInContext(name, sandbox);
const ctxResetHistory = () => vm.runInContext('history = []', sandbox);
const algosData = ctxGet('algosData');

console.log('=== T3.1 Sorting correctness (keys 1-7) ===');
for (const key of ['1', '2', '3', '4', '5', '6', '7']) {
  ctxResetHistory();
  sandbox.generateSteps(key);
  const history = ctxGet('history');
  const last = history[history.length - 1];
  const arr = [...algosData[key]].sort((a, b) => a - b);
  const sameValues = JSON.stringify([...last.values].sort((a, b) => a - b)) === JSON.stringify(arr);
  ok(isSorted(last.values) && sameValues, `key ${key} -> final array sorted & same multiset`);
  ok(last.type === 'end', `key ${key} -> last snapshot type 'end'`);
}

console.log('=== T3.2 Searching correctness (keys b1-b4) ===');
const searchTargets = { b1: 40, b2: 38, b3: 30, b4: 95 };
for (const key of ['b1', 'b2', 'b3', 'b4']) {
  ctxResetHistory();
  sandbox.generateSteps(key);
  const history = ctxGet('history');
  const found = history.filter(h => h.type === 'found');
  ok(found.length >= 1, `key ${key} -> contains a 'found' snapshot (${found.length})`);
  ok(found.some(h => h.active.includes(algosData[key].indexOf(searchTargets[key]))),
    `key ${key} -> 'found' marks the correct index of target ${searchTargets[key]}`);
}

console.log('=== T3.3 interpolationSearch NaN regression (target at arr[low]) ===');
{
  const s = sandbox;
  ctxResetHistory();
  s.interpolationSearch([5, 5, 5], 5);
  ok(ctxGet('history').some(h => h.type === 'found'), 'interpolationSearch([5,5,5],5) -> found');
  ctxResetHistory();
  s.interpolationSearch([4, 7, 30, 37, 40, 55, 92], 30); // b3 dataset
  ok(ctxGet('history').some(h => h.type === 'found' && h.active.includes(2)), 'b3 dataset -> found at index 2');
  ctxResetHistory();
  s.interpolationSearch([1, 2, 3, 4, 5], 1);
  ok(ctxGet('history').some(h => h.type === 'found'), 'interpolationSearch target=arr[0] -> found');
  ctxResetHistory();
  s.interpolationSearch([1, 2, 3, 4, 5], 5);
  ok(ctxGet('history').some(h => h.type === 'found'), 'interpolationSearch target=arr[len-1] -> found');
  ctxResetHistory();
  s.interpolationSearch([1, 2, 3, 4, 5], 99);
  ok(!ctxGet('history').some(h => h.type === 'found'), 'interpolationSearch missing target -> NOT found (no false positive)');
}

console.log('=== T3.5 selectionSort snapshot regression (string arg) ===');
{
  ctxResetHistory();
  sandbox.generateSteps('2');
  const bad = ctxGet('history').filter(h => typeof h.active === 'string');
  ok(bad.length === 0, 'selectionSort -> no snapshot with string active indices');
}

console.log('=== T3.6 Sorting correctness (keys 8-9) ===');
for (const key of ['8', '9']) {
  ctxResetHistory();
  sandbox.generateSteps(key);
  const history = ctxGet('history');
  const last = history[history.length - 1];
  const arr = [...algosData[key]].sort((a, b) => a - b);
  const sameValues = JSON.stringify([...last.values].sort((a, b) => a - b)) === JSON.stringify(arr);
  ok(isSorted(last.values) && sameValues, `key ${key} -> final array sorted & same multiset`);
  ok(last.type === 'end', `key ${key} -> last snapshot type 'end'`);
}

console.log('=== T3.7 Array operations (keys a1-a8) ===');
{
  ctxResetHistory();
  sandbox.generateSteps('a1');
  let hist = ctxGet('history');
  let last = hist[hist.length - 1];
  ok(last.sorted.length === algosData['a1'].length, 'a1 -> all indices marked as visited at the end');

  ctxResetHistory();
  sandbox.generateSteps('a2');
  hist = ctxGet('history');
  last = hist[hist.length - 1];
  const a2 = algosData['a2'];
  const maxI = a2.indexOf(Math.max(...a2)), minI = a2.indexOf(Math.min(...a2));
  ok(last.type === 'found' && last.active.includes(maxI) && last.active.includes(minI), 'a2 -> found snapshot marks max and min indices');

  ctxResetHistory();
  sandbox.generateSteps('a3');
  hist = ctxGet('history');
  const a3 = algosData['a3'];
  const pair = hist.find(h => h.type === 'found');
  ok(!!pair && pair.active.length === 2 && a3[pair.active[0]] + a3[pair.active[1]] === 10, 'a3 -> found a pair summing to target 10');

  ctxResetHistory();
  sandbox.generateSteps('a4');
  hist = ctxGet('history');
  const a4 = algosData['a4'];
  const winFound = hist.find(h => h.type === 'found');
  ok(!!winFound && winFound.active.length === 3, 'a4 -> found snapshot has window of size 3');
  if (winFound) {
    const winSum = winFound.active.reduce((s, i) => s + a4[i], 0);
    ok(winSum === 19, `a4 -> window sum equals max sum 19 (got ${winSum})`);
  }

  ctxResetHistory();
  sandbox.generateSteps('a5');
  hist = ctxGet('history');
  last = hist[hist.length - 1];
  const a5Sorted = [...algosData['a5']].sort((a, b) => a - b);
  ok(isSorted(last.values) && JSON.stringify(last.values) === JSON.stringify(a5Sorted), 'a5 -> merged array is sorted');

  ctxResetHistory();
  sandbox.generateSteps('a6');
  hist = ctxGet('history');
  last = hist[hist.length - 1];
  const a6 = algosData['a6'];
  const counts = a6.reduce((m, v) => { m[v] = (m[v] || 0) + 1; return m; }, {});
  ok(last.values.every((c, i) => c === counts[a6[i]]), 'a6 -> final heights equal frequency of each value');
  ok(Object.values(counts).reduce((a, b) => a + b, 0) === a6.length, 'a6 -> total counts equal array length');
  ok(Math.max(...last.values) === Math.max(...Object.values(counts)), 'a6 -> max height equals max frequency');

  ctxResetHistory();
  sandbox.generateSteps('a7');
  hist = ctxGet('history');
  last = hist[hist.length - 1];
  const a7 = algosData['a7'];
  const uniq = a7.filter((v, i) => a7.indexOf(v) === i);
  ok(JSON.stringify(last.values.slice(0, uniq.length)) === JSON.stringify(uniq), 'a7 -> distinct values preserved at the front');

  ctxResetHistory();
  sandbox.generateSteps('a8');
  hist = ctxGet('history');
  last = hist[hist.length - 1];
  const primes = [2, 3, 5, 7, 11];
  ok(last.type === 'found' && JSON.stringify([...last.active].sort((a, b) => a - b)) === JSON.stringify(primes), 'a8 -> primes up to 12 marked green');
}

console.log('=== T3.8 No NaN/undefined positions across all generated histories ===');
for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'b1', 'b2', 'b3', 'b4', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8']) {
  ctxResetHistory();
  sandbox.generateSteps(key);
  const history = ctxGet('history');
  let bad = 0;
  for (const h of history) {
    const idx = [...h.active, ...h.sorted];
    for (const i of idx) {
      if (Number.isNaN(i) || typeof i === 'undefined' || i < 0 || i >= h.values.length) { bad++; break; }
    }
  }
  ok(bad === 0, `key ${key} -> all snapshot indices in range (${history.length} snapshots)`);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
