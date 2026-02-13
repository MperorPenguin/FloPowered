from __future__ import annotations
import json, requests
from app.core.config import OPENAI_API_KEY, OPENAI_MODEL

INTENTS=['title','agenda','content','timeline','comparison','quote','checklist']

def rules_classify(slides:list[dict])->list[str]:
    out=[]
    for i,s in enumerate(slides):
        t=s.get('title','').lower()
        if i==0: out.append('title')
        elif 'timeline' in t or 'phase' in t: out.append('timeline')
        elif 'quote' in t: out.append('quote')
        elif 'vs' in t or 'comparison' in t: out.append('comparison')
        elif len(s.get('bullets',[]))>4: out.append('checklist')
        else: out.append('content')
    return out

def ai_classify(slides:list[dict]):
    if not OPENAI_API_KEY:
        return rules_classify(slides), {'mode':'rules'}
    prompt={"slides":slides,"task":"Return JSON array of intents using allowed labels."}
    r=requests.post('https://api.openai.com/v1/responses',headers={'Authorization':f'Bearer {OPENAI_API_KEY}'},json={"model":OPENAI_MODEL,"input":str(prompt)},timeout=30)
    txt=r.text
    try:
        data=r.json()
        content=data.get('output',[{}])[0].get('content',[{}])[0].get('text','[]')
        intents=json.loads(content)
        if not isinstance(intents,list): raise ValueError
        return intents, {'mode':'openai','raw':data}
    except Exception:
        return rules_classify(slides), {'mode':'rules_fallback','raw':txt}
