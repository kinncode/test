"""Print global snapshot times for scenes: python3 tools/times.py <scene-id> ...
For each scene: start, and the end of every cue (minus 0.3 s), as global seconds."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'timing.js'), encoding='utf-8').read()
T = json.loads(src[src.index('=') + 1:].strip().rstrip(';'))
for sc in T['scenes']:
    if len(sys.argv) > 1 and sc['id'] not in sys.argv[1:]:
        continue
    ends = [round(sc['start'] + c['e'] - .3, 1) for c in sc['cues']]
    print(f"{sc['id']:12s} start={sc['start']:.1f} dur={sc['dur']:.1f} chapterStart={sc['chapterStart']} cue_ends: {' '.join(map(str, ends))}")
