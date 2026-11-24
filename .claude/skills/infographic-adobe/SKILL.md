---
name: infographic-adobe
description: YAKUBONのインフォグラフィックC1・C2・C3の日本語組版にAdobe Fontsを使い、インフォV3の原図・完成音声・実測発話からAfter Effectsの編集用コンポジションを作る。C2の制作では半透明の医学図に合わせて見出し・対話・図中ラベルを組む。
---

# Adobe FontsとAfter Effectsで制作する

C1・C2・C3の全工程に[純黒背景・キャプションの共通ルール](../infographic-series-style/SKILL.md)を適用する。

## 静止画（C1・C2・C3）

新規制作では、図と文字を別レイヤーにする。作品で書体の指定があれば、その指定を優先する。

| シリーズ | 見出し | 本文・数値・図中ラベル |
|---|---|---|
| C1・C3 | 源ノ明朝 JP Bold | 源ノ角ゴシック JP Medium |
| C2 | 源ノ角ゴシック JP Bold | 源ノ角ゴシック JP Medium |

[C2の制作](../infographic-c2/SKILL.md)では、新人と先輩の吹き出しにも本文書体を使う。背景は純黒（#000000）に固定し、透明に近い人体・臓器には構造別の落ち着いた7色のグラデーションを使う。淡い青白や銀白の文字を選び、明るい臓器と重なるラベルは黒い余白に移す。黄色の文字や強い発光は避ける。透け感を加えた後は、医療略語・単位・数字までスマホ幅で読めるか確認する。

Adobe Fontsのカタログから日本語対応のファミリーとウェイトを確認し、Adobeのフォント追加機能で選んだ書体を追加する。スタイル固有のPostScript名を制作記録に残す。制作端末では同じAdobeアカウントのCreative Cloudと、実際に使用するアプリのフォントメニューで同期を確認する。

After Effects 24.0以降で［ファイル］→［スクリプト］→［スクリプトファイルを実行］から [YakubonInfographic.jsx](scripts/YakubonInfographic.jsx) を開く。

- **初回確認**はシリーズ（「C1・C3」または「C2」）を選んで「3秒の書体・下線見本を開く」。縦1080×1920の無音見本に選択したシリーズの見出しと本文を組み、文字サイズに応じた水色の蛍光下線を表示する。書体が未同期なら必要な名前を表示する。
- **既存レイアウト**では対象の文字レイヤーを選択し、「見出し書体を適用」か「本文書体を適用」を選ぶ。PostScript名を変更すると、別の同期済み書体も使える。適用単位は選択レイヤーの全文。混植を保つ場合は書体を変える箇所を別レイヤーにする。適用後は改行、行末、単位と数字の字形をスマホ表示で確認する。
- 完成PNGに焼き込んだ文字を組み替える場合は、元の編集可能なデータまたは文字なし原図から作業する。V3用の原図は組版を終えてから確定し、各行の文字矩形をその版で測る。静止画のみの依頼は静止画で完結する。

## 動画（V3）

C2の通常納品は指定枚数の静止画。C2原図をV3のリールにする依頼では、動画用に選定した4枚を読順に渡し、吹き出しや図中ラベルも原図上の行IDに対応づける。例えば水色指定なら対応表に `"underline_colors":{"all":"#80DEEA"}` を記入する。下線の色は文字の色と独立して指定できる。

[重要文と音声の検品](../info-v3-narration-qa/SKILL.md)と併用する。制作端末にはAfter Effects、元解像度の正方形ピクセル静止画4枚、完成音声を用意する。1部1ファイルの[共通形式](../info-v3-narration-qa/references/manifest.md)で `slides`、`plan`、`speech` を確定する。完成音声は動画の0秒と起点を合わせ、`media.audio.path` と `media.audio.sha256` を記録する。実測後の `evidence: measured`、取得法、速度、試聴結果も記入する。事前の組版工程では動画、下線の観測記録、下線の取得法は省略できる。

リポジトリのルートから実行する。Windowsでは `python` を `py -3` に読み替えられる。

```sh
python -m pip install -r .claude/skills/info-v3-narration-qa/requirements.txt
python .claude/skills/infographic-adobe/scripts/build_v3.py front.json front-edit.jsx
```

生成した `front-edit.jsx` をAfter Effectsで実行する。Windowsでは起動中のAfter Effectsに `AfterFX.exe -r "生成したJSXの絶対パス"` でも渡せる。制作端末にローカルのCodex等が接続されている場合は、この呼び出しまで行う。素材パスは生成先を基準に記録される。別端末に移すときは同じ相対配置で渡すか、移動先で再生成する。

- 原図、完成音声、各行の下線は編集可能なレイヤーに分かれる。マスターは1枚目の原図の解像度。各原図と下線は同じプリコンポジションに置くので、ページにズームを加えても一緒に動く。各部は4枚・60秒以内、既定30fps。`--fps 24` など作品の指定に合わせて変更できる。
- 下線は実際の発話開始で左から伸び、終了で消える。原図の文字列の下端と線の上端の間を1px空け、同じ文字矩形高には同じ線幅を使う。図中の同サイズの文字は、同じ基準で行の高さを測る。色は制作の見出し／本文指定、制作の全体指定、V3既定の順に解決する。
- `speech` と原図の行から演出を生成する。生成前に存在していた `underlines` は検品証跡として流用しない。編集後にプロジェクトを別名で保存し、書き出した映像上の対象行・時刻を取り直し、完成音声と照合する。既存V3の囲み、カメラ、仕上げなどは作品の指定に合わせてAEで編集する。

公式手順：[Adobe Fontsの追加](https://helpx.adobe.com/creative-cloud/apps/integration-with-other-apps/manage-fonts/add-fonts.html) ／ [After Effectsでスクリプトを実行](https://helpx.adobe.com/jp/after-effects/desktop/automate-in-after-effects/automate-animation/scripts.html)
