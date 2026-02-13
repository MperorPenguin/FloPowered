from app.pipeline.deck_model import extract_from_outline

def test_outline_to_deck_model():
    model=extract_from_outline('Title\n- one\n- two\n\nSecond\n- a')
    assert model['deck_title']=='Title'
    assert len(model['slides'])==2
