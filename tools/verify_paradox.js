// Check the visual essay before pushing:  node tools/verify_paradox.js
// Confirms every choice leads to an ending that matches the premises held.
const fs = require('fs'), path = require('path'), assert = require('assert');
const h = fs.readFileSync(path.join(__dirname, '..', 'paradox.html'), 'utf8');
const get = id => h.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`))[1];
const G = new Function(get('graph') + get('content') + 'return { NODES, SCREENS, outOf, premises };')();
assert.deepStrictEqual(Object.keys(G.SCREENS).sort(), Object.keys(G.NODES).sort());
for (const [id, s] of Object.entries(G.SCREENS)) assert.strictEqual((s.choices || []).length, G.outOf(id).length, 'buttons for ' + id);
let n = 0; (function walk(p) { const end = p[p.length - 1], v = G.premises(p); n++;
  if (end === 'ea') assert(v.P1 === false);
  if (end === 'eb') assert(v.P1 && v.P2 === false);
  if (end === 'ec') assert(v.P1 && v.P2 && v.P3 === false);
  if (end === 'ed') assert(v.P1 && v.P2 && v.P3 && v.C);
  if (end === 'x') assert(v.P1 && v.P2 && v.P3 && v.C === false);
  if (p.length < 13) G.outOf(end).forEach(e => walk([...p, e[1]])); })(['p1']);
console.log(`visual essay OK: ${n} walks consistent`);
