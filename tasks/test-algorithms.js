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

console.log('=== T3.4 No NaN/undefined positions across all generated histories ===');
for (const key of ['1', '2', '3', '4', '5', '6', '7', 'b1', 'b2', 'b3', 'b4']) {
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

console.log('=== T3.5 selectionSort snapshot regression (string arg) ===');
{
  ctxResetHistory();
  sandbox.generateSteps('2');
  const bad = ctxGet('history').filter(h => typeof h.active === 'string');
  ok(bad.length === 0, 'selectionSort -> no snapshot with string active indices');
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
