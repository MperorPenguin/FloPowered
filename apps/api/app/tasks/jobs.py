from __future__ import annotations
from pathlib import Path
import requests, subprocess
from app.tasks.celery_app import celery
from app.core.jobs import patch, dir_for, append_log
from app.pipeline.deck_model import extract_from_outline, extract_from_pptx
from app.pipeline.classify import ai_classify
from app.pipeline.specs import ai_generate_spec
from app.pipeline.validate import validate_and_fix
from app.pipeline.template_locked import convert
from app.core.config import RENDERER_URL


def _thumbs(job_id:str):
    d=dir_for(job_id); out=d/'output.pptx'; td=d/'thumbs'; td.mkdir(exist_ok=True)
    try:
        subprocess.run(['libreoffice','--headless','--convert-to','png',str(out),'--outdir',str(td)],check=True,capture_output=True)
    except Exception:
        return []
    return [p.name for p in td.glob('*.png')]

@celery.task(name='jobs.template_locked')
def template_locked(job_id:str):
    d=dir_for(job_id); patch(job_id,status='running',progress=10,message='Converting template-locked')
    try:
        convert(d/'old.pptx', d/'template.pptx', d/'output.pptx')
        thumbs=_thumbs(job_id)
        patch(job_id,status='done',progress=100,message='done',artifacts={'output':'output.pptx','thumbs':thumbs})
    except Exception as e:
        patch(job_id,status='failed',error=str(e),message='failed')

@celery.task(name='jobs.creative_nog')
def creative_nog(job_id:str, category:str, palette:list[str], creativity:str, outline_text:str|None):
    d=dir_for(job_id); patch(job_id,status='running',progress=10,message='Extracting deck model')
    deck = extract_from_outline(outline_text or '') if outline_text else extract_from_pptx(d/'old.pptx')
    patch(job_id,progress=25)
    intents,log1=ai_classify(deck['slides']); append_log(job_id,'classification',log1)
    patch(job_id,progress=45)
    spec,log2=ai_generate_spec(deck,intents,palette,creativity); append_log(job_id,'design',log2)
    fixed=validate_and_fix(spec,palette)
    (d/'slidespec.json').write_text(__import__('json').dumps(fixed,indent=2))
    patch(job_id,progress=65,message='Rendering')
    rr=requests.post(f'{RENDERER_URL}/render',json={'job_id':job_id,'spec':fixed,'palette':palette},timeout=120)
    rr.raise_for_status()
    thumbs=_thumbs(job_id)
    patch(job_id,status='done',progress=100,message='done',artifacts={'output':'output.pptx','slidespec':'slidespec.json','thumbs':thumbs})

@celery.task(name='jobs.rerender')
def rerender(job_id:str, spec:dict, palette:list[str]):
    d=dir_for(job_id)
    fixed=validate_and_fix(spec,palette)
    (d/'slidespec.json').write_text(__import__('json').dumps(fixed,indent=2))
    requests.post(f'{RENDERER_URL}/render',json={'job_id':job_id,'spec':fixed,'palette':palette},timeout=120).raise_for_status()
    patch(job_id,status='done',progress=100,message='re-rendered',artifacts={'output':'output.pptx','slidespec':'slidespec.json'})
