from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parents[3]
STORAGE_DIR = BASE_DIR / 'storage' / 'jobs'
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')
RENDERER_URL = os.getenv('RENDERER_URL', 'http://renderer:7000')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4.1-mini')
