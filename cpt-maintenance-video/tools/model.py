"""Reproduce the thesis's maintenance models numerically (Weibull, ARP, CPT variant)."""
import numpy as np

ALPHA, BETA = 425.31, 2.88          # Weibull scale (days), shape  — Table 4.1
CP, CC = 2_755_500, 9_205_500       # PM / CM cost (TWD)          — Table 4.1
CPT = {"neutral": (1.0, 1.0, 1.0), "seeking": (0.97, 0.91, 1.53), "aversion": (1.03, 0.91, 2.25)}  # (delta, gamma, lambda) — Table 4.3

t = np.arange(0, 3001, 0.05)
R = np.exp(-(t / ALPHA) ** BETA)
F = 1 - R
f = BETA / ALPHA * (t / ALPHA) ** (BETA - 1) * R
haz = BETA / ALPHA * (t / ALPHA) ** (BETA - 1)
cumR = np.concatenate([[0], np.cumsum((R[1:] + R[:-1]) / 2 * np.diff(t))])

def expected_cost(cc=CC, cp=CP):
    with np.errstate(divide="ignore", invalid="ignore"):
        return (F * cc + R * cp) / cumR

def w(p, g):
    return p ** g / (p ** g + (1 - p) ** g) ** (1 / g)

def pv_cost(delta, gamma, cc=CC, cp=CP):
    wf = w(f, gamma)
    cumw = np.concatenate([[0], np.cumsum((wf[1:] + wf[:-1]) / 2 * np.diff(t))])
    tail = cumw[-1] - cumw
    with np.errstate(divide="ignore", invalid="ignore"):
        return (cumw * cc ** delta + tail * cp ** delta) / cumR

def argmin(c, lo=1, hi=1000):
    m = (t >= lo) & (t <= hi)
    i = np.nanargmin(np.where(m, c, np.inf))
    return t[i], c[i]

if __name__ == "__main__":
    tau, c = argmin(expected_cost())
    print(f"expected: tau*={tau:.2f} d, cost={c:.1f} TWD/day, R={np.exp(-(tau/ALPHA)**BETA):.4f}")
    for k, (d, g, l) in CPT.items():
        tau, c = argmin(pv_cost(d, g))
        print(f"CPT {k}: tau*={tau:.2f}, PV cost={c:.4g}, R={np.exp(-(tau/ALPHA)**BETA):.4f}")
    from math import gamma as G
    print("MTTF", ALPHA * G(1 + 1 / BETA))
