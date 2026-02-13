from app.pipeline.validate import validate_and_fix

def test_palette_and_font_rules_and_split():
    spec={'slides':[{'title':'X','body':['a'*300,'b'*300],'palette_plan':{'dominant':'#123456'},'a11y':{'min_title_pt':10,'min_body_pt':10}}]}
    out=validate_and_fix(spec,['#088590','#EDB83D','#C55502','#D70026'])
    assert len(out['slides'])==2
    assert out['slides'][0]['a11y']['min_body_pt']>=24
    assert out['slides'][0]['palette_plan']['dominant']=='#088590'
