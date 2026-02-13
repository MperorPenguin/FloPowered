from __future__ import annotations
import json, requests
from app.core.config import OPENAI_API_KEY, OPENAI_MODEL

TEMPLATES=['hero','cards','icon-grid','timeline','split','quote','comparison','checklist']

def build_rules_spec(deck:dict,intents:list[str],palette:list[str],creativity:str):
    specs=[]
    for i,sl in enumerate(deck['slides']):
        tid='hero' if i==0 else ('split' if creativity=='High' and i%2 else 'cards')
        if intents[i] in TEMPLATES: tid=intents[i]
        specs.append({
            'template_id':tid,
            'title':sl['title'],
            'body':sl.get('bullets',[]),
            'icon_slots':[],
            'motif':'wave' if creativity=='High' else 'banded',
            'palette_plan':{'dominant':palette[0],'accent':palette[1],'contrast':palette[2]},
            'a11y':{'min_title_pt':32,'min_body_pt':24,'contrast':'AA'},
            'animation_plan':['title','body','visuals']
        })
    return {'deck_title':deck['deck_title'],'slides':specs}

def ai_generate_spec(deck:dict,intents:list[str],palette:list[str],creativity:str):
    if not OPENAI_API_KEY:
        return build_rules_spec(deck,intents,palette,creativity), {'mode':'rules'}
    prompt={"deck":deck,"intents":intents,"palette":palette,"creativity":creativity,"schema":"strict json object {deck_title,slides[]}"}
    r=requests.post('https://api.openai.com/v1/responses',headers={'Authorization':f'Bearer {OPENAI_API_KEY}'},json={"model":OPENAI_MODEL,"input":str(prompt)},timeout=45)
    try:
        data=r.json(); content=data.get('output',[{}])[0].get('content',[{}])[0].get('text','{}'); obj=json.loads(content)
        return obj, {'mode':'openai','raw':data}
    except Exception:
        return build_rules_spec(deck,intents,palette,creativity), {'mode':'rules_fallback','raw':r.text}
