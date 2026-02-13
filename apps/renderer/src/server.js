const express = require('express');
const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({limit:'5mb'}));

function render(spec,palette,outPath){
  const pptx = new PptxGenJS();
  pptx.author='NOG Deck Studio';
  const nearWhite='F8FAFC';
  (spec.slides||[]).forEach((s,idx)=>{
    const slide=pptx.addSlide();
    const dominant=(s.palette_plan?.dominant||palette[0]||'#273E65').replace('#','');
    const accent=(s.palette_plan?.accent||palette[1]||'#E2241C').replace('#','');
    slide.background={color: nearWhite};
    slide.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.33,h:0.5,fill:{color:dominant},line:{color:dominant}});
    slide.addText(s.title||`Slide ${idx+1}`,{x:0.6,y:0.7,w:12,h:1,fontFace:'Aptos Black',fontSize:34,color:dominant,bold:true});
    const body=(s.body||[]).map(b=>`• ${b}`).join('\n');
    slide.addText(body,{x:0.9,y:1.8,w:11.8,h:4.8,fontFace:'Aptos Black',fontSize:24,color:'1E1F26',breakLine:true});
    slide.addShape(pptx.ShapeType.line,{x:0.6,y:1.55,w:4,h:0,line:{color:accent,pt:2}});
    slide.addNotes(`animation:${(s.animation_plan||[]).join('>')} motif:${s.motif||'banded'}`);
  });
  return pptx.writeFile({fileName:outPath});
}

app.post('/render', async (req,res)=>{
  try{
    const {job_id,spec,palette=[]}=req.body;
    const base = path.resolve('/workspace/powerpointmaker/storage/jobs',job_id);
    fs.mkdirSync(base,{recursive:true});
    const out=path.join(base,'output.pptx');
    await render(spec,palette,out);
    res.json({ok:true,output:out});
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/health',(_,res)=>res.json({ok:true}));
if (require.main === module) {
  app.listen(7000,'0.0.0.0',()=>console.log('renderer on 7000'));
}
module.exports={render,app};
