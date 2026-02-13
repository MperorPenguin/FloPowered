const fs = require('fs');
const path = require('path');
const { render } = require('../src/server');
(async ()=>{
  const out = path.resolve('/tmp/renderer-smoke.pptx');
  await render({slides:[{title:'Hello',body:['world'],palette_plan:{dominant:'#273E65',accent:'#E2241C'}}]},['#273E65','#E2241C'],out);
  if(!fs.existsSync(out)) throw new Error('PPT not generated');
  console.log('renderer smoke pass');
  process.exit(0);
})();
