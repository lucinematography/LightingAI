const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('app/src/main/assets/catalog.js', 'utf8');
async function check(fail) {
  const elements = {equipmentList:{innerHTML:'OLD DEMO'},equipmentChecks:{innerHTML:'OLD DEMO'}};
  const requests=[];
  const context={window:null,document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[]},fetch:()=>new Promise((resolve,reject)=>requests.push({resolve,reject}))};
  context.window=context;
  vm.createContext(context); vm.runInContext(code,context);
  assert.match(elements.equipmentList.innerHTML,/Učitavanje kataloga/);
  assert.doesNotMatch(elements.equipmentList.innerHTML,/OLD DEMO/);
  assert.doesNotMatch(elements.equipmentChecks.innerHTML,/OLD DEMO/);
  if(fail) requests.forEach(r=>r.reject(new Error('offline')));
  else requests.forEach(r=>r.resolve({json:()=>Promise.resolve([])}));
  await new Promise(resolve=>setImmediate(resolve));
  assert.doesNotMatch(elements.equipmentList.innerHTML,/OLD DEMO|Učitavanje kataloga/);
  assert.match(elements.equipmentList.innerHTML,fail?/nije moguće učitati/:/PRETRAGA KATALOGA/);
}
(async()=>{await check(false);await check(true);console.log('Catalog startup: delayed success and failure passed');})();
