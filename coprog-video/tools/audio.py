"""Synthesize a soft ambient music bed, duck it under the narration, and mix.

Inputs : build/narration.wav, timing.js
Output : out/audio.m4a (AAC, loudness-normalized)
"""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 24000


def read_wav(p):
    with wave.open(p) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def write_wav(p, a):
    a = np.clip(a, -1, 1)
    with wave.open(p, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def music(total):
    n = int(total * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2), np.float32)
    # Dmaj7 – Bm7 – Gmaj7 – A(add9), 6 s per chord
    chords = [[50, 54, 57, 61], [47, 50, 54, 57], [43, 47, 50, 54], [45, 49, 52, 59]]
    CH = 6.0
    rng = np.random.default_rng(3)
    for ci in range(int(np.ceil(total / CH)) + 1):
        notes = chords[ci % 4]
        t0 = ci * CH
        i0, i1 = max(0, int((t0 - 1.5) * SR)), min(n, int((t0 + CH + 1.5) * SR))
        if i0 >= n:
            break
        tt = t[i0:i1] - t0
        env = np.clip((tt + 1.5) / 1.8, 0, 1) * np.clip((CH + 1.5 - tt) / 1.8, 0, 1)
        env = env * env * (3 - 2 * env)
        for k, m in enumerate(notes):
            f = mtof(m + 12)
            for det, pan in ((0.9985, 0.3), (1.0015, 0.7)):
                ph = rng.uniform(0, 2 * np.pi)
                w = (np.sin(2 * np.pi * f * det * tt + ph) + 0.18 * np.sin(4 * np.pi * f * det * tt + ph)) * env * 0.05
                out[i0:i1, 0] += w * (1 - pan); out[i0:i1, 1] += w * pan
        # sub bass on the root
        fb = mtof(notes[0] - 12)
        b = np.sin(2 * np.pi * fb * tt) * env * 0.06
        out[i0:i1] += b[:, None]
        # soft plucked arpeggio, eighth notes at 80 bpm
        step = 60 / 80 / 2
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for j in range(int(CH / step)):
            ts = t0 + j * step
            s0 = int(ts * SR)
            L = int(1.6 * SR)
            if s0 >= n:
                break
            s1 = min(n, s0 + L)
            u = np.arange(s1 - s0) / SR
            f = mtof(notes[pattern[j % 8]] + 24)
            vel = 0.022 * (1.0 if j % 4 == 0 else 0.7)
            p = (np.sin(2 * np.pi * f * u) + 0.3 * np.sin(4 * np.pi * f * u) * np.exp(-u * 6)) * np.exp(-u * 3.2) * vel
            p *= np.clip(u / 0.004, 0, 1)
            pan = 0.35 + 0.3 * ((j * 3) % 5) / 4
            out[s0:s1, 0] += p * (1 - pan); out[s0:s1, 1] += p * pan
    # gentle low-pass (truncated one-pole kernel) for a softer tone
    a = np.exp(-2 * np.pi * 3500 / SR)
    k = (1 - a) * a ** np.arange(48)
    for ch in range(2):
        out[:, ch] = np.convolve(out[:, ch], k)[:n]
    d = int(0.33 * SR)
    echo = np.zeros_like(out); echo[d:, 0] = out[:-d, 1] * 0.28; echo[d:, 1] = out[:-d, 0] * 0.28
    out += echo
    return out


def chime(n_samples):
    u = np.arange(n_samples) / SR
    s = np.zeros(n_samples, np.float32)
    for f, g in ((1318.5, 1.0), (1975.5, 0.5), (2637.0, 0.25)):
        s += np.sin(2 * np.pi * f * u) * g
    return s * np.exp(-u * 2.8) * np.clip(u / 0.003, 0, 1) * 0.06


def main():
    src = open(os.path.join(ROOT, "timing.js"), encoding="utf-8").read()
    timing = json.loads(src[src.index("=") + 1:].strip().rstrip(";"))
    total = timing["total"]
    voice = read_wav(os.path.join(ROOT, "build", "narration.wav"))
    n = int(total * SR)
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    voice = voice / (np.abs(voice).max() + 1e-9) * 0.89

    m = music(total)
    # ducking envelope from narration
    win = int(0.05 * SR)
    env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    env = (env > 0.02).astype(np.float32)
    att, rel = np.exp(-1 / (0.08 * SR)), np.exp(-1 / (0.6 * SR))
    sm = np.empty_like(env); acc = 0.0
    # attack/release smoother (block-wise for speed)
    step = 240
    for i in range(0, n, step):
        tgt = env[i:i + step].max()
        coef = att ** step if tgt > acc else rel ** step
        acc = tgt + (acc - tgt) * coef
        sm[i:i + step] = acc
    gain = 1.0 - 0.6 * sm
    fade = np.clip(np.arange(n) / (2.0 * SR), 0, 1) * np.clip((n - np.arange(n)) / (4.0 * SR), 0, 1)
    m *= (gain * fade)[:, None] * 0.33

    ch = chime(int(2.5 * SR))
    for sc in timing["scenes"]:
        if sc.get("chapterStart"):
            i = int((sc["start"] + 0.2) * SR)
            j = min(n, i + len(ch))
            m[i:j, 0] += ch[:j - i] * 0.9; m[i:j, 1] += ch[:j - i]

    mix = m + voice[:, None]
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    tmp = os.path.join(ROOT, "build", "mix.wav")
    write_wav(tmp, mix)
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000",
                    "-c:a", "aac", "-b:a", "192k", os.path.join(ROOT, "out", "audio.m4a")], check=True)
    print("music rms dB (no voice):", 20 * np.log10(np.sqrt((m[: int(2.5 * SR)] ** 2).mean()) + 1e-9))
    print("wrote out/audio.m4a", total, "s")


if __name__ == "__main__":
    main()
