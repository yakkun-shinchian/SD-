#!/usr/bin/env python3
"""YAKUBON STUDIO モーションレンダラー

完成済みインフォグラフィック（PNG）を「一切再生成せず」に、その上へ
カメラ移動（Zoom / Pan / Ken Burns）と手描き風アノテーション
（蛍光ペン・アンダーライン・丸囲み・囲み枠・矢印・点滅・指差し・吹き出し…）
を重ね、ナレーション・字幕・BGM・効果音と同期した MP4 を書き出す。

    python3 render.py timeline.json            # MP4 を書き出す
    python3 render.py timeline.json --stills 3,12.5,20   # 確認用の静止画だけ書き出す

依存: Python3 + Pillow + numpy + ffmpeg（＋ローカル仮ナレーション用に open_jtalk）
タイムラインの書き方は studio/README.md を参照。
"""
import argparse, json, math, os, random, re, shutil, subprocess, sys, tempfile, wave

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont

SR = 48000
FONT_CANDIDATES = [
    "/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf",
    "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf",
    "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",
    "C:/Windows/Fonts/meiryob.ttc",
]
COLORS = {
    "yellow": (255, 235, 59), "red": (229, 57, 53), "green": (46, 160, 67),
    "blue": (30, 110, 235), "orange": (245, 124, 0), "pink": (236, 64, 122),
    "white": (255, 255, 255), "black": (20, 20, 20),
}


def color(c, default="red"):
    c = c or default
    if isinstance(c, (list, tuple)):
        return tuple(c)
    if c.startswith("#"):
        return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
    return COLORS[c]


def font(px):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return ImageFont.truetype(p, int(px))
    return ImageFont.load_default()


def ease_io(t):  # ease-in-out sine：カメラ用（ゆっくり始まりゆっくり止まる）
    t = min(max(t, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def ease_out(t):  # ease-out cubic：線が伸びる系
    t = min(max(t, 0.0), 1.0)
    return 1 - (1 - t) ** 3


# ────────────────────────────── タイムライン
class Timeline:
    def __init__(self, path):
        self.base = os.path.dirname(os.path.abspath(path))
        with open(path, encoding="utf-8") as fp:
            self.d = json.load(fp)
        d = self.d
        self.W, self.H = d.get("output", {}).get("size", [1080, 1920])
        self.fps = d.get("output", {}).get("fps", 30)
        self.img = Image.open(self.p(d["image"])).convert("RGB")
        lay = {}
        if d.get("layout"):
            with open(self.p(d["layout"]), encoding="utf-8") as fp:
                lay = json.load(fp)
        self.anchors = dict(lay.get("anchors", {}))
        self.anchors.update(d.get("anchors", {}))
        self.src_w, self.src_h = lay.get("size", d.get("source_size", self.img.size))
        self.k = self.img.size[0] / self.src_w  # 論理座標→画像ピクセル
        self.bg = color(d.get("background", "#") if d.get("background") else list(self.img.getpixel((2, self.img.size[1] - 3))))
        self.seg = {}
        self.narr_wavs = []

    def p(self, rel):
        return rel if os.path.isabs(rel) else os.path.join(self.base, rel)

    # "n2.start+0.3" / "n2.end" / "n2.mid" / 数値
    def t(self, e):
        if isinstance(e, (int, float)):
            return float(e)
        m = re.fullmatch(r"\s*(\w+)\.(start|end|mid)\s*([+-]\s*[\d.]+)?\s*", e)
        if not m:
            return float(e)
        s, en = self.seg[m.group(1)]
        base = {"start": s, "end": en, "mid": (s + en) / 2}[m.group(2)]
        return base + (float(m.group(3).replace(" ", "")) if m.group(3) else 0.0)

    def rect(self, r, pad=0):
        if isinstance(r, str):
            if r == "full":
                return [0, 0, self.src_w, self.src_h]
            r = self.anchors[r]
        x, y, w, h = r
        return [x - pad, y - pad, w + 2 * pad, h + 2 * pad]

    def point(self, p):
        """[x,y] か "アンカー名" か "アンカー名@left|right|top|bottom|center"."""
        if isinstance(p, (list, tuple)):
            return tuple(p)
        name, _, side = p.partition("@")
        x, y, w, h = self.rect(name)
        return {"": (x + w / 2, y + h / 2), "center": (x + w / 2, y + h / 2),
                "left": (x, y + h / 2), "right": (x + w, y + h / 2),
                "top": (x + w / 2, y), "bottom": (x + w / 2, y + h)}[side]


# ────────────────────────────── 音声
def read_wav(path):
    with wave.open(path) as w:
        sr, ch, sw, n = w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()
        raw = w.readframes(n)
    a = np.frombuffer(raw, dtype={2: np.int16, 4: np.int32}[sw]).astype(np.float32)
    a /= {2: 32768.0, 4: 2147483648.0}[sw]
    if ch > 1:
        a = a.reshape(-1, ch).mean(axis=1)
    if sr != SR:  # 簡易リサンプル
        x = np.linspace(0, len(a) - 1, int(len(a) * SR / sr))
        a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
    return a


def write_wav(path, a):
    a = np.clip(a, -1, 1)
    st = np.stack([a, a], axis=1) if a.ndim == 1 else a
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def tts_openjtalk(text, out, speed=1.0):
    dic = next((p for p in ["/var/lib/mecab/dic/open-jtalk/naist-jdic", "/usr/share/open_jtalk/dic"] if os.path.isdir(p)), None)
    voice = next((os.path.join(r, f) for r, _, fs in os.walk("/usr/share/hts-voice") for f in fs if f.endswith(".htsvoice")), None)
    if not (shutil.which("open_jtalk") and dic and voice):
        raise SystemExit("open_jtalk が見つかりません（仮ナレーション用）。音声ファイル指定(wav)を使ってください。")
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as fp:
        fp.write(text)
    subprocess.run(["open_jtalk", "-x", dic, "-m", voice, "-r", str(speed), "-ow", out, fp.name], check=True)
    os.unlink(fp.name)


def build_narration(tl, workdir):
    """各ナレーションの音声を用意し、開始・終了時刻（秒）を決める。"""
    nd = tl.d.get("narration", {})
    t = float(nd.get("lead_in", 0.8))
    gap = float(nd.get("gap", 0.45))
    for i, s in enumerate(nd.get("segments", [])):
        sid = s.get("id", f"n{i + 1}")
        if s.get("wav"):  # CoeFont / ElevenLabs / VOICEVOX などで書き出した音声
            path = tl.p(s["wav"])
        else:
            path = os.path.join(workdir, f"{sid}.wav")
            tts_openjtalk(s.get("speak", s.get("subtitle", "")), path, nd.get("speed", 1.0))
        a = read_wav(path)
        if "at" in s:
            t = tl.t(s["at"])
        tl.seg[sid] = (t, t + len(a) / SR)
        tl.narr_wavs.append((t, a, s))
        t += len(a) / SR + float(s.get("pause", gap))
    return t


def synth_sfx(kind):
    n = lambda sec: np.arange(int(SR * sec)) / SR
    rng = np.random.default_rng(7)
    if kind == "pop":
        x = n(0.12); f = 900 * np.exp(-x * 25) + 300
        return 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 30)
    if kind == "ding":
        x = n(0.9)
        return 0.28 * (np.sin(2 * np.pi * 1318.5 * x) + 0.4 * np.sin(2 * np.pi * 2637 * x)) * np.exp(-x * 5)
    if kind == "swoosh":
        x = n(0.45); w = rng.standard_normal(len(x))
        w = np.convolve(w, np.ones(12) / 12, mode="same")
        return 0.35 * w * np.sin(np.pi * x / x[-1]) ** 2
    if kind == "pen":  # マーカーのキュッという擦過音
        x = n(0.35); w = rng.standard_normal(len(x))
        w = w - np.convolve(w, np.ones(6) / 6, mode="same")
        return 0.12 * w * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * x)) * np.sin(np.pi * x / x[-1])
    raise ValueError(kind)


def synth_bgm(sec):
    """著作権フリー（自前合成）のやさしいパッド BGM。C - Am - F - G を循環。"""
    x = np.arange(int(SR * sec)) / SR
    chords = [[261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7]]
    bar = 4.0
    out = np.zeros_like(x)
    for i in range(int(sec // bar) + 1):
        s, e = int(i * bar * SR), min(len(x), int((i + 1) * bar * SR + SR * 0.5))
        if s >= len(x):
            break
        xx = x[s:e] - x[s]
        env = np.minimum(1, xx / 0.8) * np.minimum(1, (xx[-1] - xx + 1e-3) / 0.8)
        for f in chords[i % 4]:
            out[s:e] += env * (np.sin(2 * np.pi * f * xx) + 0.25 * np.sin(4 * np.pi * f * xx)) / 3
        # 軽いアルペジオ
        for j in range(8):
            f = chords[i % 4][j % 3] * 2
            a, b = s + int(j * bar / 8 * SR), s + int((j * bar / 8 + 0.4) * SR)
            if b <= len(x):
                xx2 = np.arange(b - a) / SR
                out[a:b] += 0.18 * np.sin(2 * np.pi * f * xx2) * np.exp(-xx2 * 9)
    fade = np.minimum(1, np.minimum(x / 1.5, (x[-1] - x) / 2.0))
    return out * fade / max(1e-6, np.abs(out).max())


def build_audio(tl, dur, overlays, out):
    total = np.zeros(int(SR * (dur + 0.5)), np.float32)
    voice = np.zeros_like(total)
    for t, a, _ in tl.narr_wavs:
        s = int(t * SR)
        voice[s:s + len(a)] += a[: len(voice) - s]
    peak = np.abs(voice).max()
    if peak > 0:
        voice *= 0.85 / peak
    total += voice
    bgm = tl.d.get("bgm")
    if bgm:
        vol = float(bgm.get("volume", 0.10))
        m = read_wav(tl.p(bgm["file"])) if bgm.get("file") else synth_bgm(dur + 0.5)
        m = np.resize(m, len(total)) if len(m) < len(total) else m[: len(total)]
        # ナレーション中は BGM を下げる（ダッキング）
        env = np.abs(voice) > 0.01
        k = int(SR * 0.25)
        duck = np.convolve(env.astype(np.float32), np.ones(k) / k, mode="same")
        total += m * vol * (1 - 0.55 * np.clip(duck * 3, 0, 1))
    for o in overlays:
        if o.get("sfx"):
            s = int(o["_t0"] * SR)
            fx = synth_sfx(o["sfx"]) * float(o.get("sfx_volume", 1.0))
            total[s:s + len(fx)] += fx[: len(total) - s]
    write_wav(out, total * 0.95 / max(1.0, np.abs(total).max()))


# ────────────────────────────── カメラ
class Camera:
    """keyframes: {"at": 時刻, "focus": アンカー|rect|"full", "move": 移動秒, "pad": 余白, "drift": Ken Burns 量}"""

    def __init__(self, tl):
        self.tl = tl
        self.aspect = tl.W / tl.H
        self.max_zoom = float(tl.d.get("camera_max_zoom", 2.6))
        self.keys = []
        for k in tl.d.get("camera", [{"at": 0, "focus": "full"}]):
            r = tl.rect(k.get("focus", "full"), k.get("pad", 30))
            self.keys.append({"t": tl.t(k.get("at", 0)), "move": float(k.get("move", 1.6)),
                              "drift": float(k.get("drift", 0.0)), "v": self.fit(r)})
        self.keys.sort(key=lambda k: k["t"])

    def fit(self, r):
        x, y, w, h = r
        vw = max(w, h * self.aspect, self.tl.src_w / self.max_zoom)
        # "full" が画面比と違う場合は全体が収まるよう余白付き（contain）にする
        vw = min(vw, max(self.tl.src_w, self.tl.src_h * self.aspect))
        return (x + w / 2, y + h / 2, vw)

    def clamp(self, cx, cy, vw):
        vh = vw / self.aspect
        sw, sh = self.tl.src_w, self.tl.src_h
        cx = sw / 2 if vw >= sw else min(max(cx, vw / 2), sw - vw / 2)
        cy = sh / 2 if vh >= sh else min(max(cy, vh / 2), sh - vh / 2)
        return cx, cy, vw

    def at(self, t):
        ks = self.keys
        state = ks[0]["v"]  # 直前のキーの到達値（次の移動の出発点）
        cur = state
        for i, k in enumerate(ks):
            if t < k["t"]:
                break
            p = ease_io((t - k["t"]) / k["move"]) if k["move"] > 0 else 1.0
            cx = state[0] + (k["v"][0] - state[0]) * p
            cy = state[1] + (k["v"][1] - state[1]) * p
            vw = math.exp(math.log(state[2]) + (math.log(k["v"][2]) - math.log(state[2])) * p)
            # Ken Burns：到着後、次のキーまでゆっくり寄り続ける
            nxt = ks[i + 1]["t"] if i + 1 < len(ks) else None
            if k["drift"] and t > k["t"] + k["move"]:
                hold = max(0.01, (nxt if nxt is not None else self.tl.duration) - k["t"] - k["move"])
                vw /= 1 + k["drift"] * min(1, (t - k["t"] - k["move"]) / hold)
            cur = (cx, cy, vw)
            state = self._end(i)
        return self.clamp(*cur)

    def _end(self, i):
        k = self.keys[i]
        cx, cy, vw = k["v"]
        if k["drift"]:
            vw /= 1 + k["drift"]
        return cx, cy, vw


# ────────────────────────────── アノテーション描画（スーパーサンプリングでアンチエイリアス）
SS = 2


class Painter:
    def __init__(self, tl, view):
        self.tl = tl
        cx, cy, vw = view
        vh = vw / (tl.W / tl.H)
        self.vx, self.vy = cx - vw / 2, cy - vh / 2
        self.s = tl.W / vw  # 論理座標 → 画面ピクセル
        self.layer = None
        self.marker = None

    def P(self, x, y):
        return ((x - self.vx) * self.s * SS, (y - self.vy) * self.s * SS)

    def L(self):
        if self.layer is None:
            self.layer = Image.new("RGBA", (self.tl.W * SS, self.tl.H * SS), (0, 0, 0, 0))
            self.draw = ImageDraw.Draw(self.layer)
        return self.draw

    def M(self):
        if self.marker is None:
            self.marker = Image.new("RGB", (self.tl.W, self.tl.H), (255, 255, 255))
            self.mdraw = ImageDraw.Draw(self.marker)
        return self.mdraw

    def stroke(self, pts, col, width, alpha=255):
        if len(pts) < 2:
            return
        d = self.L()
        w = max(1, int(width * self.s * SS))
        sp = [self.P(*p) for p in pts]
        d.line(sp, fill=col + (alpha,), width=w, joint="curve")
        r = w / 2
        for p in (sp[0], sp[-1]):
            d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=col + (alpha,))


def wobble(n, seed, amp):
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, 6.28) for _ in range(3)]
    return [amp * (math.sin(i / n * 6.28 * 1.3 + ph[0]) * 0.6 + math.sin(i / n * 6.28 * 3.1 + ph[1]) * 0.3
                   + math.sin(i / n * 6.28 * 0.5 + ph[2]) * 0.4) for i in range(n + 1)]


def partial(pts, p):
    """折れ線の先頭から割合 p ぶんだけ返す（線が伸びるアニメ用）。"""
    if p >= 1:
        return pts
    seg = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
    total, acc, out = sum(seg), 0.0, [pts[0]]
    goal = total * max(p, 0)
    for i, s in enumerate(seg):
        if acc + s >= goal:
            r = (goal - acc) / s if s else 0
            out.append((pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r))
            return out
        acc += s
        out.append(pts[i + 1])
    return out


def draw_overlay(o, t, pt, tl):
    t0, t1 = o["_t0"], o["_t0"] + o["_dur"]
    if t < t0:
        return
    until = o.get("_until")
    alpha = 1.0
    if until is not None:
        if t > until + 0.4:
            return
        if t > until:
            alpha = 1 - (t - until) / 0.4
    p = ease_out((t - t0) / max(0.01, o["_dur"]))
    typ = o["type"]
    col = color(o.get("color"), {"highlight": "yellow", "circle": "green", "box": "blue",
                                  "arrow": "red", "underline": "red", "pulse": "orange",
                                  "pointer": "red"}.get(typ, "red"))
    A = int(255 * alpha)
    seed = o.get("seed", hash(json.dumps(o.get("target", o.get("from", "")), ensure_ascii=False)) & 0xFFFF)

    if typ == "highlight":  # 蛍光ペン：左→右に伸び、乗算合成で文字を潰さない
        x, y, w, h = tl.rect(o["target"], o.get("pad", 6))
        lin = (t - t0) / max(0.01, o["_dur"])  # 読み上げに合わせて一定速度
        md = pt.M()
        x0, y0 = pt.P(x, y)
        x1, y1 = pt.P(x + w * min(1, max(0, lin)), y + h)
        mix = lambda c: tuple(int(255 - (255 - v) * alpha) for v in c)
        if x1 > x0:
            md.rounded_rectangle([x0 / SS, y0 / SS, x1 / SS, y1 / SS], radius=6, fill=mix(col))
    elif typ == "underline":  # 手書きアンダーライン
        x, y, w, h = tl.rect(o["target"])
        yy = y + h + o.get("offset", 8)
        n = 40
        wb = wobble(n, seed, 2.5)
        pts = [(x - 6 + (w + 12) * i / n, yy + wb[i] + (i / n) * o.get("slope", -3)) for i in range(n + 1)]
        pt.stroke(partial(pts, p), col, o.get("width", 7), A)
    elif typ == "circle":  # 手描きの丸囲み（少し行き過ぎて閉じる）
        x, y, w, h = tl.rect(o["target"], o.get("pad", 18))
        cx, cy, rx, ry = x + w / 2, y + h / 2, w / 2, h / 2
        n = 90
        wb = wobble(n, seed, 0.035)
        a0 = math.radians(-110)
        pts = [(cx + rx * (1 + wb[i]) * math.cos(a0 + 2 * math.pi * 1.08 * i / n),
                cy + ry * (1 + wb[i] * 1.2) * math.sin(a0 + 2 * math.pi * 1.08 * i / n)) for i in range(n + 1)]
        pt.stroke(partial(pts, p), col, o.get("width", 8), A)
    elif typ == "box":  # 大きな囲み枠（周囲をなぞって描く）
        x, y, w, h = tl.rect(o["target"], o.get("pad", 16))
        r = o.get("radius", 26)
        pts = []
        for (ax, ay, a_start) in [(x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)]:
            for k in range(13):
                a = math.radians(a_start + 90 * k / 12)
                pts.append((ax + r * math.cos(a), ay + r * math.sin(a)))
        pts = [(x + w / 2, y)] + pts + [(x + w / 2, y)]
        pt.stroke(partial(pts, p), col, o.get("width", 10), A)
    elif typ == "arrow":  # 伸びる矢印（ゆるいカーブ）
        (ax, ay), (bx, by) = tl.point(o["from"]), tl.point(o["to"])
        bend = o.get("bend", 0.15)
        mx, my = (ax + bx) / 2 - (by - ay) * bend, (ay + by) / 2 + (bx - ax) * bend
        n = 40
        pts = [((1 - u) ** 2 * ax + 2 * (1 - u) * u * mx + u * u * bx,
                (1 - u) ** 2 * ay + 2 * (1 - u) * u * my + u * u * by) for u in (i / n for i in range(n + 1))]
        part = partial(pts, p)
        wdt = o.get("width", 10)
        pt.stroke(part, col, wdt, A)
        if len(part) >= 2:
            (px, py), (qx, qy) = part[-2], part[-1]
            ang = math.atan2(qy - py, qx - px)
            hl = wdt * 3.4
            head = [(qx + math.cos(ang) * hl * 0.5, qy + math.sin(ang) * hl * 0.5),
                    (qx + math.cos(ang + 2.5) * hl, qy + math.sin(ang + 2.5) * hl),
                    (qx + math.cos(ang - 2.5) * hl, qy + math.sin(ang - 2.5) * hl)]
            pt.L().polygon([pt.P(*h) for h in head], fill=col + (A,))
    elif typ == "pulse":  # 重要箇所の点滅・グロー
        x, y, w, h = tl.rect(o["target"], o.get("pad", 10))
        k = 0.5 - 0.5 * math.cos(2 * math.pi * o.get("rate", 1.6) * (t - t0))
        if t > t1:
            k = 0.0 if until is None or t > until else k
        d = pt.L()
        for i in range(4):
            g = 4 + i * 5
            a = int(A * k * (0.55 - i * 0.12))
            x0, y0 = pt.P(x - g, y - g)
            x1, y1 = pt.P(x + w + g, y + h + g)
            d.rounded_rectangle([x0, y0, x1, y1], radius=int(18 * SS), outline=col + (max(0, a),), width=int(5 * SS))
    elif typ == "pointer":  # 指差し（バウンドする▼マーカー）
        x, y, w, h = tl.rect(o["target"])
        bob = 10 * abs(math.sin(2 * math.pi * 1.2 * (t - t0)))
        tipx, tipy = x + w / 2, y - 8 - bob
        sz = o.get("size", 34)
        tri = [(tipx, tipy), (tipx - sz * 0.6, tipy - sz), (tipx + sz * 0.6, tipy - sz)]
        pt.L().polygon([pt.P(*q) for q in tri], fill=col + (int(A * min(1, p * 2)),))
    elif typ == "callout":  # 吹き出し（ポップイン）
        x, y = tl.point(o["at_point"]) if "at_point" in o else tl.point(o["target"] + "@top")
        sc = ease_out(min(1, (t - t0) / 0.35)) * (1 + 0.08 * math.sin(min(1, (t - t0) / 0.35) * math.pi))
        fpx = o.get("font", 34) * pt.s * SS * sc
        if fpx < 2:
            return
        f = font(fpx)
        d = pt.L()
        tx, ty = pt.P(x + o.get("dx", 0), y + o.get("dy", -70))
        bb = d.textbbox((tx, ty), o["text"], font=f, anchor="mm")
        m = 16 * SS * sc
        d.rounded_rectangle([bb[0] - m, bb[1] - m, bb[2] + m, bb[3] + m], radius=int(18 * SS * sc), fill=(255, 255, 255, A),
                            outline=col + (A,), width=max(1, int(4 * SS * sc)))
        ax_, ay_ = pt.P(x, y)
        d.polygon([(ax_, ay_), (tx - 14 * SS * sc, bb[3] + m - 2), (tx + 14 * SS * sc, bb[3] + m - 2)], fill=col + (A,))
        d.text((tx, ty), o["text"], font=f, fill=(30, 30, 30, A), anchor="mm")
    elif typ == "label":  # テキスト（slide / fade / pop で登場）、counter で数字カウントアップ
        x, y = tl.point(o["at_point"])
        q = ease_out(min(1, (t - t0) / max(0.01, o["_dur"])))
        txt = o["text"]
        if "count_to" in o:
            v = o.get("count_from", 0) + (o["count_to"] - o.get("count_from", 0)) * q
            txt = txt.format(v=round(v, o.get("decimals", 0)) if o.get("decimals") else int(round(v)))
        anim = o.get("anim", "fade")
        dx = (1 - q) * -120 if anim == "slide" else 0
        f = font(o.get("font", 48) * pt.s * SS * (q if anim == "pop" else 1) + 1)
        a = int(A * (q if anim in ("fade", "slide") else 1))
        pt.L().text(pt.P(x + dx, y), txt, font=f, fill=color(o.get("color"), "black") + (a,), anchor="mm",
                    stroke_width=int(o.get("stroke", 0) * SS), stroke_fill=(255, 255, 255, a))


def apply_wiggle(frame, overlays, t, pt, tl):
    """図や人物の軽い揺れ：指定領域を小さく回転させて貼り戻す。"""
    for o in overlays:
        if o["type"] != "wiggle" or t < o["_t0"] or t > o["_t0"] + o["_dur"]:
            continue
        x, y, w, h = tl.rect(o["target"])
        (x0, y0), (x1, y1) = pt.P(x, y), pt.P(x + w, y + h)
        box = tuple(int(v / SS) for v in (x0, y0, x1, y1))
        if box[2] <= box[0] or box[3] <= box[1]:
            continue
        reg = frame.crop(box)
        ang = o.get("deg", 2.0) * math.sin(2 * math.pi * o.get("rate", 1.5) * (t - o["_t0"]))
        frame.paste(reg.rotate(ang, resample=Image.BICUBIC, fillcolor=reg.getpixel((1, 1))), box[:2])


# ────────────────────────────── 字幕
def wrap_ja(text, n):
    lines, cur = [], ""
    for ch in text:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        cur += ch
        if len(cur) >= n and ch not in "、。」）":
            lines.append(cur); cur = ""
    if cur:
        lines.append(cur)
    # 行頭の句読点を前の行へ
    for i in range(1, len(lines)):
        while lines[i] and lines[i][0] in "、。」）":
            lines[i - 1] += lines[i][0]; lines[i] = lines[i][1:]
    return [l for l in lines if l]


def draw_subtitle(frame, text, t, s0, s1, tl, seg=None):
    st = dict(tl.d.get("subtitle_style", {}))
    if seg and "subtitle_y" in seg:  # 区間ごとに字幕位置を変えられる
        st["y"] = seg["subtitle_y"]
    size = st.get("size", 54)
    lines = wrap_ja(text, st.get("chars_per_line", 15))
    f = font(size)
    lay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    a = min(1, (t - s0) / 0.15, max(0, (s1 + 0.25 - t) / 0.2))
    if a <= 0:
        return frame
    cy = tl.H * st.get("y", 0.70)  # Shorts/Reels/TikTok の下部UIを避ける位置
    lh = size * 1.35
    top = cy - lh * len(lines) / 2
    wmax = max(d.textlength(l, font=f) for l in lines)
    d.rounded_rectangle([tl.W / 2 - wmax / 2 - 28, top - 18, tl.W / 2 + wmax / 2 + 28, top + lh * len(lines) + 12],
                        radius=22, fill=(0, 0, 0, int(150 * a)))
    for i, l in enumerate(lines):
        d.text((tl.W / 2, top + lh * i + lh / 2), l, font=f, anchor="mm", fill=(255, 255, 255, int(255 * a)),
               stroke_width=4, stroke_fill=(0, 0, 0, int(255 * a)))
    return Image.alpha_composite(frame.convert("RGBA"), lay).convert("RGB")


def srt_time(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


# ────────────────────────────── メイン
def render_frame(tl, cam, overlays, t):
    cx, cy, vw = cam.at(t)
    vh = vw / (tl.W / tl.H)
    k = tl.k
    # resize(box=…) は小数座標の切り出しに対応し、transform より高速（サブピクセルでカクつかない）
    iw, ih = tl.img.size
    bx0, by0, bx1, by1 = (cx - vw / 2) * k, (cy - vh / 2) * k, (cx + vw / 2) * k, (cy + vh / 2) * k
    box = (max(0.0, bx0), max(0.0, by0), min(iw, bx1), min(ih, by1))
    if box == (bx0, by0, bx1, by1) or (abs(box[0] - bx0) < 1e-6 and abs(box[2] - bx1) < 1e-6
                                       and abs(box[1] - by0) < 1e-6 and abs(box[3] - by1) < 1e-6):
        frame = tl.img.resize((tl.W, tl.H), Image.BICUBIC, box=box)
    else:  # 画像の外側は背景色で埋める（16:9 で縦長画像全体を見せる時など）
        sc = tl.W / (bx1 - bx0)
        frame = Image.new("RGB", (tl.W, tl.H), tl.bg)
        dw, dh = round((box[2] - box[0]) * sc), round((box[3] - box[1]) * sc)
        frame.paste(tl.img.resize((dw, dh), Image.BICUBIC, box=box), (round((box[0] - bx0) * sc), round((box[1] - by0) * sc)))
    pt = Painter(tl, (cx, cy, vw))
    apply_wiggle(frame, overlays, t, pt, tl)
    for o in overlays:
        draw_overlay(o, t, pt, tl)
    if pt.marker is not None:
        frame = ImageChops.multiply(frame, pt.marker)
    if pt.layer is not None:
        bb = pt.layer.getbbox()
        if bb:  # 描いた範囲だけ縮小して貼る（全面合成より速い）
            bb = tuple(v // SS * SS for v in bb[:2]) + tuple(-(-v // SS) * SS for v in bb[2:])
            ov = pt.layer.crop(bb).resize(((bb[2] - bb[0]) // SS, (bb[3] - bb[1]) // SS), Image.BOX)
            frame.paste(ov, (bb[0] // SS, bb[1] // SS), ov)
    for st, a, s in tl.narr_wavs:
        en = st + len(a) / SR
        if st <= t <= en + 0.25 and s.get("subtitle"):
            frame = draw_subtitle(frame, s["subtitle"], t, st, en, tl, s)
    fo = tl.d.get("fade", {})
    dur = tl.duration
    g = min(1, t / fo.get("in", 0.4) if fo.get("in", 0.4) else 1, (dur - t) / fo.get("out", 0.6) if fo.get("out", 0.6) else 1)
    if g < 1:
        frame = Image.eval(frame, lambda v: int(v * max(0, g) + 255 * (1 - max(0, g)) * fo.get("to_white", 0)))
    return frame


_JOB = None


def _render_bytes(i):
    tl, cam, overlays = _JOB
    return render_frame(tl, cam, overlays, i / tl.fps).tobytes()


def prepare_overlays(tl):
    out = []
    for o in tl.d.get("overlays", []):
        o = dict(o)
        if "sync" in o:  # ナレーション区間の割合で指定： "sync":"n2", "from":0.1, "to":0.7
            s, e = tl.seg[o["sync"]]
            o["_t0"] = s + (e - s) * o.get("from", 0.0)
            o["_dur"] = max(0.05, (e - s) * (o.get("to", 1.0) - o.get("from", 0.0)))
        else:
            o["_t0"] = tl.t(o["start"])
            o["_dur"] = float(o.get("dur", 0.8))
        o["_until"] = tl.t(o["until"]) if "until" in o else None
        out.append(o)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("timeline")
    ap.add_argument("-o", "--out")
    ap.add_argument("--size", help="出力サイズ上書き 例: 1080x1350（4:5）/ 1920x1080（16:9）")
    ap.add_argument("-j", "--jobs", type=int, help="並列プロセス数（既定: CPU数）")
    ap.add_argument("--stills", help="カンマ区切り秒数。確認用PNGを書き出して終了")
    args = ap.parse_args()

    tl = Timeline(args.timeline)
    if args.size:
        tl.W, tl.H = (int(v) for v in args.size.lower().split("x"))
    work = tempfile.mkdtemp(prefix="yakubon_")
    end = build_narration(tl, work)
    tl.duration = float(tl.d.get("duration", end + float(tl.d.get("tail", 1.2))))
    cam = Camera(tl)
    overlays = prepare_overlays(tl)
    out = args.out or tl.p(tl.d.get("output", {}).get("file", "out.mp4"))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)

    if args.stills:
        for s in args.stills.split(","):
            p = os.path.splitext(out)[0] + f"_still_{float(s):05.1f}s.png"
            render_frame(tl, cam, overlays, float(s)).save(p)
            print(p)
        return

    wav = os.path.join(work, "mix.wav")
    build_audio(tl, tl.duration, overlays, wav)
    with open(os.path.splitext(out)[0] + ".srt", "w", encoding="utf-8") as fp:
        for i, (st, a, s) in enumerate(tl.narr_wavs, 1):
            fp.write(f"{i}\n{srt_time(st)} --> {srt_time(st + len(a) / SR)}\n{s.get('subtitle', '')}\n\n")

    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{tl.W}x{tl.H}",
           "-r", str(tl.fps), "-i", "-", "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = int(round(tl.duration * tl.fps))
    global _JOB
    _JOB = (tl, cam, overlays)
    import multiprocessing as mp
    with mp.get_context("fork").Pool(args.jobs or os.cpu_count()) as pool:  # フレームは独立なので並列化
        for i, buf in enumerate(pool.imap(_render_bytes, range(n), chunksize=4)):
            proc.stdin.write(buf)
            if i % (tl.fps * 5) == 0:
                print(f"  {i / tl.fps:5.1f}s / {tl.duration:.1f}s", file=sys.stderr)
    proc.stdin.close()
    if proc.wait():
        raise SystemExit("ffmpeg failed")
    shutil.rmtree(work, ignore_errors=True)
    print(out)


if __name__ == "__main__":
    main()
