from __future__ import annotations

def _allowed(palette:list[str]):
    return set(c.lower() for c in palette+['#ffffff','#f8fafc'])

def validate_and_fix(spec:dict,palette:list[str]):
    allowed=_allowed(palette)
    fixed=[]
    for slide in spec.get('slides',[]):
        plan=slide.get('palette_plan',{})
        for k,v in list(plan.items()):
            if str(v).lower() not in allowed:
                plan[k]=palette[0]
        a11y=slide.get('a11y',{})
        a11y['min_title_pt']=max(32,int(a11y.get('min_title_pt',32)))
        a11y['min_body_pt']=max(24,int(a11y.get('min_body_pt',24)))
        body=slide.get('body',[])
        if sum(len(x) for x in body)>500 and len(body)>1:
            mid=len(body)//2
            s1={**slide,'body':body[:mid]}
            s2={**slide,'title':slide.get('title','')+' (Part 2)','body':body[mid:]}
            fixed.extend([s1,s2])
        else:
            slide['palette_plan']=plan; slide['a11y']=a11y; fixed.append(slide)
    spec['slides']=fixed
    return spec
