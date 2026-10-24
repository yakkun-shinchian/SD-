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
