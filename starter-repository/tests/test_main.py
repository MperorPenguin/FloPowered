from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.main import main


def test_main_message() -> None:
    assert main() == "Hello from your new repository!"
