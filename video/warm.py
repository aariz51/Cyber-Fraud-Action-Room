"""Pull the Chatterbox weights so the first real generation is not the slow one."""
import time, torch
from chatterbox.tts import ChatterboxTTS
t0 = time.time()
dev = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"loading on {dev} ...", flush=True)
m = ChatterboxTTS.from_pretrained(device=dev)
print(f"model ready in {time.time()-t0:.1f}s  sr={m.sr}", flush=True)
