from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from app.core.jobs import make_job, dir_for, read, list_jobs, delete_job
from app.tasks.jobs import template_locked, creative_nog, rerender

router=APIRouter(prefix='/api')
CAT_PATH=Path(__file__).resolve().parents[1]/'data'/'nog_categories.json'

def _category(name:str):
    groups=json.loads(CAT_PATH.read_text())['groups']
    for g in groups:
        if g['name']==name: return g
    raise HTTPException(400,'Invalid category')

@router.get('/health')
def health(): return {'ok':True}

@router.get('/categories')
def categories(): return json.loads(CAT_PATH.read_text())

@router.get('/jobs')
def jobs(): return list_jobs()

@router.delete('/jobs/{job_id}')
def drop(job_id:str): delete_job(job_id); return {'ok':True}

@router.get('/jobs/{job_id}')
def job(job_id:str):
    d=read(job_id)
    if d.get('status')=='missing': raise HTTPException(404,'not found')
    return {'job_id':job_id, **d}

@router.get('/jobs/{job_id}/download')
def dl(job_id:str):
    p=dir_for(job_id)/'output.pptx'
    if not p.exists(): raise HTTPException(404,'not ready')
    return FileResponse(p, filename=f'flopowered-deck-{job_id}.pptx')

@router.get('/jobs/{job_id}/spec')
def get_spec(job_id:str):
    p=dir_for(job_id)/'slidespec.json'
    if not p.exists(): raise HTTPException(404,'no spec')
    return json.loads(p.read_text())

@router.post('/jobs/{job_id}/rerender')
def do_rerender(job_id:str, payload:dict):
    palette=payload.get('palette',[])
    spec=payload.get('spec',{})
    rerender.delay(job_id,spec,palette)
    return {'job_id':job_id}

@router.post('/convert/template-locked')
async def convert_locked(old_pptx:UploadFile=File(...), template_pptx:UploadFile=File(...)):
    jid=make_job(); d=dir_for(jid)
    (d/'old.pptx').write_bytes(await old_pptx.read())
    (d/'template.pptx').write_bytes(await template_pptx.read())
    template_locked.delay(jid)
    return {'job_id':jid}

@router.post('/convert/creative')
async def convert_creative(
    category_group:str=Form(...),
    creativity:str=Form('Med'),
    outline_text:str=Form(''),
    old_pptx:UploadFile|None=File(None)
):
    grp=_category(category_group)
    jid=make_job(); d=dir_for(jid)
    if old_pptx is not None:
        (d/'old.pptx').write_bytes(await old_pptx.read())
    creative_nog.delay(jid, category_group, grp['palette'], creativity, outline_text or None)
    return {'job_id':jid}
