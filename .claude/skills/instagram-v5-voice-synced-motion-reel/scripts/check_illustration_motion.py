#!/usr/bin/env python3
"""Compare an illustration-only ROI at two times in a rendered video.

Outputs a changed-pixel fraction; interpretation still requires visual review.
Coordinates are in source pixels. ffmpeg and ffprobe must be installed.
"""
import argparse
import json
import subprocess
import sys


def run(command):
    return subprocess.run(command, check=True, capture_output=True).stdout


def frame(video, t, box):
    x, y, w, h = box
    return run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", video,
                "-frames:v", "1", "-vf", f"crop={w}:{h}:{x}:{y},format=gray",
                "-f", "rawvideo", "-"])


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("video")
    p.add_argument("--times", nargs=2, type=float, required=True, metavar=("START", "END"))
    p.add_argument("--roi", nargs=4, type=int, required=True, metavar=("X", "Y", "W", "H"))
    p.add_argument("--pixel-threshold", type=int, default=12)
    a = p.parse_args()
    info = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                           "-show_entries", "stream=width,height", "-of", "json", a.video]))
    sw, sh = ((info["streams"][0][k]) for k in ("width", "height"))
    x, y, w, h = a.roi
    if x < 0 or y < 0 or w <= 0 or h <= 0 or x+w > sw or y+h > sh:
        p.error(f"ROI outside {sw}x{sh} source")
    if a.times[0] < 0 or a.times[0] >= a.times[1]:
        p.error("times must be increasing and non-negative")
    f0, f1 = (frame(a.video, t, a.roi) for t in a.times)
    if len(f0) != w*h or len(f1) != w*h:
        p.error("Could not decode requested frames; check video duration")
    count = sum(abs(v0-v1) > a.pixel_threshold for v0, v1 in zip(f0, f1))
    print(json.dumps({"times": a.times, "roi": a.roi, "changed_fraction": round(count/(w*h), 5),
                      "note": "Measure only the illustration, after its entrance. Playback is required to judge meaningful motion."}))


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(exc.stderr.decode(errors="replace"), file=sys.stderr)
        sys.exit(1)
