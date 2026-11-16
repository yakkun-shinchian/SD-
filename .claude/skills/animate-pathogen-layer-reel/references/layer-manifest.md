# レイヤー制作票・マニフェスト

`base` は最初のフレームで表示される1080×1920の背景と人物。各`image`は独立した透過PNGで、`x,y`は元フレーム上の左上座標。`start`は登場の開始秒、`duration`は着地までの秒数。`audio`はその吹き出しを読む取得済み音声。画像と声の順番を固定する。`point`は最後約3秒で表示する。

```json
{
  "base": "layers/base.png",
  "duration": 40,
  "layers": [
    {"kind":"title", "image":"layers/title.png", "x":273, "y":220, "start":0.25, "duration":1.0},
    {"kind":"bubble", "image":"layers/01.png", "x":75, "y":415, "start":2.2, "duration":0.43, "motion":"down", "audio":"audio/01.mp3"},
    {"kind":"bubble", "image":"layers/02.png", "x":75, "y":610, "start":8.8, "duration":0.43, "motion":"left", "audio":"audio/02.mp3"},
    {"kind":"bubble", "image":"layers/03.png", "x":735, "y":450, "start":15.5, "duration":0.43, "motion":"right", "audio":"audio/03.mp3"},
    {"kind":"bubble", "image":"layers/04.png", "x":760, "y":670, "start":23.7, "duration":0.43, "motion":"down", "audio":"audio/04.mp3"},
    {"kind":"bubble", "image":"layers/05.png", "x":755, "y":820, "start":30.0, "duration":0.43, "motion":"right", "audio":"audio/05.mp3"},
    {"kind":"point", "image":"layers/point.png", "x":90, "y":1510, "start":37.0, "duration":0.65}
  ]
}
```

この時刻は**形式例だけ**。実際のMP3長を測ってから確定する。位置も絵ごとに作り直す。POINTの下部位置はInstagramのUIプレビューで再確認する。音声開始は自動的に`start + duration + 0.12`秒。`motion`は`down`、`left`、`right`を受け付ける。上からの移動が顔に重なる時だけ左右を選ぶ。
