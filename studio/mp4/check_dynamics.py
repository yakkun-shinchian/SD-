#!/usr/bin/env python3
"""完成動画の「見せ場が立っているか」を数字で測る道具。

ffmpeg だけを使います。生成・課金・外部接続はありません。
`studio/mp4/edit.py` の出力（final.mp4 / _完成.mp4）や、
過去作のMP4をそのまま渡せます。

    python3 studio/mp4/check_dynamics.py 作品/_完成.mp4
    python3 studio/mp4/check_dynamics.py 作品/_完成.mp4 --highlight 7,12
    python3 studio/mp4/check_dynamics.py 作品/_完成.mp4 --json 作品/dynamics.json

測るもの（すべて相対値。絶対的な「良い動画」の基準ではありません）:
  動き量  … 1コマ前との差の平均（縮小・白黒にしてから測る）
  カット  … 場面の切り替わり（ffmpeg の scdet）
  判定    … そのカットが、この動画の中で動いている方か・静かな方か

人の目の代わりにはなりません。解剖の正しさ・テロップの読みやすさ・
声との合いは測れません。最後は必ず通しで見てください。
"""
import argparse
import json
import re
import statistics
import subprocess
import sys
from pathlib import Path

METRIC = re.compile(r"pts_time:([0-9.]+)")
VALUE = re.compile(r"=([0-9.]+)\s*$")


def run(args):
    p = subprocess.run(args, capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit(f"ffmpeg が失敗しました: {' '.join(args[:6])}…\n{p.stderr[-800:]}")
    return p


def probe(path):
    p = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
             "stream=width,height,avg_frame_rate", "-show_entries", "format=duration",
             "-of", "json", str(path)])
    d = json.loads(p.stdout)
    st = d["streams"][0]
    num, _, den = st["avg_frame_rate"].partition("/")
    fps = float(num) / float(den or 1) if float(den or 1) else 0.0
    return {
        "width": st["width"], "height": st["height"], "fps": round(fps, 3),
        "duration": float(d["format"]["duration"]),
    }


def series(path, vf, key, width):
    """1コマごとの (秒, 値) を取り出す。"""
    p = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path),
             "-vf", vf.format(w=width), "-an", "-f", "null", "-"])
    out, t = [], None
    for line in p.stderr.splitlines() + p.stdout.splitlines():
        m = METRIC.search(line)
        if m:
            t = float(m.group(1))
            continue
        if key in line and t is not None:
            v = VALUE.search(line)
            if v:
                out.append((t, float(v.group(1))))
                t = None
    return out


def motion_series(path, width):
    vf = ("scale={w}:-2,format=gray,tblend=all_mode=difference,signalstats,"
          "metadata=print:key=lavfi.signalstats.YAVG:file=-")
    return [(t, v * 10.0) for t, v in series(path, vf, "signalstats.YAVG", width)]


def scene_series(path, width):
    vf = "scale={w}:-2,scdet=s=0,metadata=print:key=lavfi.scd.score:file=-"
    return series(path, vf, "scd.score", width)


def find_cuts(scenes, threshold, min_gap):
    """切り替わりの秒を返す。近すぎる検出はまとめる（クロスフェード対策）。"""
    marks = []
    for t, score in scenes:
        if score >= threshold and t > 0.05:
            if not marks or t - marks[-1] >= min_gap:
                marks.append(t)
    return marks


def build_cuts(motion, marks, duration, skip):
    """カットごとに統計を出す。切り替わり直後の数コマは差が大きいので捨てる。"""
    bounds = [0.0] + marks + [duration]
    cuts = []
    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        vals = [v for t, v in motion if a + skip <= t < b]
        if len(vals) < 2:
            vals = [v for t, v in motion if a <= t < b] or [0.0]
        cuts.append({
            "no": i + 1,
            "start": round(a, 2),
            "end": round(b, 2),
            "dur": round(b - a, 2),
            "motion": round(statistics.median(vals), 2),
            "motion_peak": round(max(vals), 2),
        })
    return cuts


STILL = 0.15  # これ以下は、ほぼ静止画とみなす


def judge(cuts, highlights, opening_sec):
    med = statistics.median([c["motion"] for c in cuts]) if cuts else 0.0
    avg_dur = statistics.mean([c["dur"] for c in cuts]) if cuts else 0.0
    by_no = {c["no"]: c for c in cuts}
    notes = []

    for c in cuts:
        if c["motion"] <= STILL:
            c["level"] = "止"           # ほぼ静止。中央値がいくつでも静止は静止
        elif med <= STILL:
            c["level"] = "動"           # 全体が止まっている中で、ここだけ動いている
        elif c["motion"] >= med * 1.3:
            c["level"] = "動"
        elif c["motion"] <= med * 0.7:
            c["level"] = "静"
        else:
            c["level"] = "中"
        c["highlight"] = c["no"] in highlights

    still = [c for c in cuts if c["level"] == "止"]
    if cuts and len(still) == len(cuts):
        notes.append("✗ 全編がほぼ静止画です（動いているカットが1つもありません）。"
                     "見せ場を決めて、そこだけでも動画化してください。")
    elif still:
        sec = sum(c["dur"] for c in still)
        total = sum(c["dur"] for c in cuts)
        if total and sec / total >= 0.25:
            nos = "、".join(str(c["no"]) for c in still)
            notes.append(f"△ ほぼ静止のカットが {sec:.1f}秒（全体の{sec/total*100:.0f}%）あります"
                         f"（カット{nos}）。終盤に固まっていると、最後まで見てもらえません。")

    # つかみ
    head = [c for c in cuts if c["start"] < opening_sec]
    if head and statistics.median([c["motion"] for c in head]) < med:
        notes.append(f"△ つかみが弱い：最初の{opening_sec:.0f}秒の動きが、動画全体の中央値を下回っています。")

    # 山場
    for n in sorted(highlights):
        c = by_no.get(n)
        if not c:
            notes.append(f"? カット{n}は見つかりません（全{len(cuts)}カット）。")
            continue
        if c["motion"] <= max(med, STILL):
            notes.append(f"✗ カット{n}（山場）の動き {c['motion']} が全体の中央値 {med:.2f} 以下です。"
                         "絵を3枚（前・瞬間・後）に作り直すか、別の道具で動かし直してください。")
        if c["dur"] < avg_dur * 1.3:
            notes.append(f"△ カット{n}（山場）の尺 {c['dur']}秒 が、平均 {avg_dur:.1f}秒 の1.3倍に届きません。")
        prev = by_no.get(n - 1)
        if prev and prev["motion"] >= med:
            notes.append(f"△ カット{n}の直前（カット{n-1}）が静かではありません（{prev['motion']}）。"
                         "直前を短く静かにすると、山場が立ちます。")

    # 単調
    run_len, start_no = 1, cuts[0]["no"] if cuts else 0
    for a, b in zip(cuts, cuts[1:]):
        if a["level"] == b["level"]:
            run_len += 1
        else:
            if run_len >= 4:
                notes.append(f"△ カット{start_no}〜{a['no']} が同じ調子（{a['level']}）で{run_len}連続です。")
            run_len, start_no = 1, b["no"]
    if cuts and run_len >= 4:
        notes.append(f"△ カット{start_no}〜{cuts[-1]['no']} が同じ調子で{run_len}連続です。")

    return med, avg_dur, notes


def main():
    ap = argparse.ArgumentParser(description="完成動画の見せ場を数字で測ります。")
    ap.add_argument("video", type=Path)
    ap.add_argument("--highlight", default="", help="山場のカット番号（例 7,12）")
    ap.add_argument("--cut-threshold", type=float, default=0.4, help="切り替わりの検出のきびしさ（既定0.4）")
    ap.add_argument("--min-gap", type=float, default=0.8, help="これより近い検出はまとめる秒数（既定0.8）")
    ap.add_argument("--skip", type=float, default=0.25, help="切り替わり直後に捨てる秒数（既定0.25）")
    ap.add_argument("--opening", type=float, default=3.0, help="つかみとみなす秒数（既定3.0）")
    ap.add_argument("--width", type=int, default=240, help="測るときの横幅（既定240）")
    ap.add_argument("--json", type=Path, help="結果をJSONで保存")
    a = ap.parse_args()

    if not a.video.exists():
        raise SystemExit(f"動画が見つかりません: {a.video}")
    highlights = {int(x) for x in a.highlight.replace("、", ",").split(",") if x.strip()}

    info = probe(a.video)
    motion = motion_series(a.video, a.width)
    if not motion:
        raise SystemExit("動きを測れませんでした（コマが取り出せません）。")
    scenes = scene_series(a.video, a.width)
    marks = find_cuts(scenes, a.cut_threshold, a.min_gap)
    cuts = build_cuts(motion, marks, info["duration"], a.skip)
    med, avg_dur, notes = judge(cuts, highlights, a.opening)

    print(f"\n{a.video.name}  {info['width']}x{info['height']}  {info['fps']}fps  "
          f"{info['duration']:.1f}秒  {len(cuts)}カット\n")
    print("  No  開始     尺     動き   山   調子   めやす")
    print("  " + "-" * 56)
    for c in cuts:
        bar = "█" * min(20, max(1, int(c["motion"] / max(med, 0.01) * 5)))
        print(f"  {c['no']:>2}  {c['start']:>6.2f} {c['dur']:>5.2f}  {c['motion']:>6.2f}  "
              f"{'★' if c['highlight'] else ' '}   {c['level']}    {bar}")
    print("  " + "-" * 56)
    print(f"  動きの中央値 {med:.2f} ／ 平均の尺 {avg_dur:.2f}秒\n")

    if notes:
        print("気になるところ")
        for n in notes:
            print(f"  {n}")
    else:
        print("気になるところ：ありません（指定した山場は立っています）。")
    print("\n※ 測ったのは動きの量と尺だけです。解剖の正しさ・テロップ・声の合いは"
          "測っていません。最後は必ず通しで見てください。")

    if a.json:
        a.json.write_text(json.dumps({
            "video": str(a.video), "info": info, "cuts": cuts,
            "motion_median": round(med, 3), "duration_mean": round(avg_dur, 3),
            "highlights": sorted(highlights), "notes": notes,
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\n保存しました: {a.json}")


if __name__ == "__main__":
    main()
