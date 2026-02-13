from celery import Celery
from app.core.config import REDIS_URL

celery = Celery('nog_deck_studio', broker=REDIS_URL, backend=REDIS_URL)
