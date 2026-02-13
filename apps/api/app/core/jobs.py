from __future__ import annotations
import json, uuid, shutil
from pathlib import Path
from typing import Any
from app.core.config import STORAGE_DIR

DEFAULT = {"status":"queued","progress":0,"message":"queued","error":None,"artifacts":{},"logs":[]}

def make_job() -> str:
    jid = str(uuid.uuid4())
    d = STORAGE_DIR / jid
    (d / 'thumbs').mkdir(parents=True, exist_ok=True)
    write(jid, DEFAULT)
    return jid

def dir_for(job_id:str)->Path:
    d = STORAGE_DIR / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d

def read(job_id:str)->dict[str,Any]:
    p = dir_for(job_id)/'job.json'
    if not p.exists():
        return {"status":"missing"}
    return json.loads(p.read_text())

def write(job_id:str,data:dict[str,Any]):
    (dir_for(job_id)/'job.json').write_text(json.dumps(data,indent=2))

def patch(job_id:str, **updates):
    d = read(job_id)
    d.update(updates)
    write(job_id,d)
    return d

def append_log(job_id:str, label:str, payload:Any):
    d = read(job_id)
    logs = d.get('logs',[])
    logs.append({"label":label,"payload":payload})
    d['logs']=logs
    write(job_id,d)

def list_jobs():
    out=[]
    for p in sorted(STORAGE_DIR.glob('*')):
        if p.is_dir():
            d = read(p.name)
            if d.get('status')!='missing':
                out.append({"job_id":p.name, **d})
    return out

def delete_job(job_id:str):
    d=STORAGE_DIR/job_id
    if d.exists(): shutil.rmtree(d)
