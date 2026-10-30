# 生成済みMP4＋書き出し済み音声の一括編集

このコマンドはローカルのFFmpegだけを使います。Gemini / CoeFontへの接続、生成、API課金はありません。`studio/motion` のM3・M4処理を呼び出さず、変更もしません。

## 実行

必要: Python 3.9以降、FFmpeg（libx264・libass）、ffprobe、Fontconfig、使用するフォント。Python追加パッケージ不要。指定したfamilyが存在しない場合は代替書体へ黙って切り替えずエラーになります。日本語の例では `Noto Serif CJK JP` をインストールしてください。

リポジトリのルートで:

```bash
# scene_manifest.example.jsonを作品フォルダへコピーし、素材パス・採用区間を設定
python3 studio/mp4/edit.py build /path/to/project/scene_manifest.json --output-dir /path/to/project/edited
# 字幕・サイズ・色・書体・位置だけを変更したら
python3 studio/mp4/edit.py subtitles /path/to/project/scene_manifest.json --output-dir /path/to/project/edited
# 自動試験（ローカル合成素材だけを使用）
python3 -m unittest discover -s studio/mp4/tests -v
# 従来M3/M4の回帰試験（Pillow、numpyが必要）
python3 -m unittest discover -s studio/tests -v
```

## マニフェスト

- `version`: 1。
- `output.size`: 幅・高さ（偶数px）。既定1080×1920。`fps`: 整数、既定30。
- `scenes`: 配列の順に連結。`id` は重複しない場面名。
- `file`: マニフェストからの相対パスまたは絶対パス。ローカル素材のみ。
- `in`, `out`: 元動画の採用開始・終了秒、終了は含まない。出力フレーム単位に丸める。速度変更・ループ・静止延長・逆再生はしない。
- `subtitles`: 各場面の開始を0秒とする `start`, `end`, `text`。時刻省略時は場面全体。改行はJSONの `\n`。ASSの制御記法を防ぐため、文字列中のバックスラッシュと波括弧は拒否。
- `subtitle_style`: 共通指定。各字幕の `style` で上書きできる。
- `font`: インストール済みフォントのfamily名。`size`: 出力解像度でのピクセル相当のASSサイズ。`color`: `#RRGGBB`。
- `position`: `[x,y]`、画面左上を原点とする字幕ブロックの中心座標。自動折返ししないため必要な場所に改行する。字幕の字形・はみ出しは最終画面で確認する。
- `audio`: 書き出し済みCoeFont音声などの配列。`file`, `at`（完成映像内の開始秒、既定0）, `in`（音声の採用開始秒、既定0）, `out`（省略時は末尾）, `volume`（既定1）。複数音声は加算ミックスするので重複時の音量に注意。音声終了が映像を超えるとエラー。末尾を勝手に切らない。
- 元MP4の音声は使わない。`audio`が空なら無音。字幕と音声の自動文字起こし・同期推定はしない。
- `image`, `prompt`, `source`, `status` など制作メモを場面に追加しても編集対象にはならない。生成・配信済みなどの状態を自動で宣言しない。

## 出力と再開

- `master.mp4`: 字幕なし映像＋指定音声。H.264/yuv420p、音声ありの場合AAC、faststart。
- `final.mp4`: マスターから字幕を焼き込んだ完成映像。音声は再エンコードせずコピー。
- `captions.ass`: 合成した字幕定義。
- `cache.json`: 編集設定・入力内容・マスターのSHA-256と実行結果。

`build` は入力内容のハッシュまで検査し、編集設定・素材が同じならマスターを再利用します。字幕だけの差分はマスターを無効化しません。素材・順序・区間・音声が変わった場合は再構築します。

`subtitles` はマスターと編集設定の一致を確認します。元動画・音声は再取得不要です。ただし元ファイルの現在の変更は調べません。素材変更を反映するには `build` を使ってください。マニフェストを別ディレクトリへ動かすと相対パスの解決先が変わるため再buildが必要です。

出力は一時ディレクトリで完成させてから置換します。同じ出力先で同時に複数のコマンドを実行しないでください。マスター・キャッシュはセットで保管してください。

## 制約

本機能は動画編集の自動化です。医学的妥当性、画像内に既に焼き込まれた文字の除去、CoeFontの声種確認、音声と解説の内容一致、字幕の全文字の収まりを自動保証しません。公開前に通しで確認してください。

## 緑ネオン＋1.3倍速（追加設定）

既存マニフェストはそのまま利用できます。未指定時は従来の字幕・等速音声です。

```json
{
  "subtitle_preset": "neon_green",
  "subtitle_style": {
    "font": "Noto Sans CJK JP",
    "size": 96,
    "position": [540, 345],
    "glow": {"blur": 10, "strength": 0.7}
  },
  "audio": [{"file": "voice.wav", "in": 0, "out": 52, "at": 0, "speed": 1.3}]
}
```

- `neon_green` は緑 `#39FF14`、サイズ96、上部中央、二層の発光と鮮明な文字を設定します。`subtitle_style`、字幕ごとの `style` で上書き可能。`glow` を上書きするとそのオブジェクト全体が置換されます。
- `glow.blur`: 0〜50、ASS座標でのぼかし半径。`strength`: 0〜1、各発光層の不透明度。0で従来描画。輪郭を二層重ね、前面の文字はぼかしません。
- `audio[].speed`: 0.5〜2（既定1）。`atempo`で音程を保ちます。`in/out`は**元音声の秒数**、`at`は**完成動画の秒数**です。音声の終了予定は `at + (out-in)/speed`。映像の速度・長さは変えません。音声後の残り時間は無音になります。
- `output.max_duration`: 任意の上限秒。腎臓動画では60を指定。超過時は切断せずエラー。
- 字幕の `audio_index` を省略すると、従来どおり場面内の完成動画時刻です。速度変更によって勝手に移動しません。
- `audio_index: 0` を指定すると `start/end` は `audio[0]` の**トリム前の元音声時刻**です。`at + (字幕時刻-in)/speed` で完成動画時刻へ変換します。`start/end` と対象音声の `out` を必ず指定してください。トリム外、所属場面外、ASSで表現できない短い字幕を拒否します。
- 例：音声 `in=0.65, out=3.9, at=0.5, speed=1.3`、字幕 `start=1.3, end=2.6` → 完成動画では **1.00〜2.00秒**、音声終了予定は **3.00秒**。
- 字幕は明示した区間・位置にだけ描画します。既存文字の自動検出はしません。既に文字がある場面には `subtitles: []` を使い、必要な説明だけ空いている位置へ指定してください。

`cache.json` に変換後の `subtitle_times`、予定上の `audio_ends`、実測コンテナの `audio_stream_duration` を記録します。音声は末尾無音を含む映像全長、字幕はASSで0.01秒単位、表示はフレーム単位です。`atempo`の信号末尾には数十ms程度の差があり得ます。これは発話内容の自動同期認定ではありません。

発光・書体・サイズ・位置・字幕時刻だけの編集は `subtitles` モードでマスターを再利用します。音声速度変更はマスター音声が変わるため `build` が必要です。M3/M4には変更しません。

### 再現可能な短い比較

[samples/neon/scene_manifest.json](samples/neon/scene_manifest.json) は実行可能な設定例です。

```bash
python3 studio/mp4/samples/neon/make_sample.py
```

同じ合成背景・440Hz音を用い、`comparison.mp4` に通常速度4秒→ネオン＋1.3倍速4秒を収録します。素材に焼き込んだ既存の説明文字を下部に残し、新しい字幕は上部に配置します。**実際の腎臓動画・CoeFont音声ではありません。実音声との同期は未検証です。** 有料APIは呼びません。

## ナレーション無音チェック

書き出し前の無音候補検査・CT/3D保持区間・BGM除外の設定と検証結果は [SILENCE_CHECK.md](SILENCE_CHECK.md) を参照してください。
