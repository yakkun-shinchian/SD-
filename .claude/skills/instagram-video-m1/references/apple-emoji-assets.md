# Apple絵文字の実素材

ユーザーが自身のMacでCoreText／AppleColorEmojiから書き出し、2026-10-02に提供した素材。フォント本体は含めない。

- 保存済みZIPの`M1-Apple-Emoji.50pnqi/png/`: 3,548枚、256×256 RGBA透過PNG。画像本体はスキル内に同梱しない。
- `assets/apple-emoji/manifest.json`: emoji、codepoints、description、group、subgroup、file、renderer。
- `assets/apple-emoji/needs-review.json`: 未対応または要確認415件。別の絵文字を選ぶか実描画を確認するまで使用しない。
- `assets/apple-emoji/report.json`: macOS 27.0.1 build 26A434、Unicodeカタログ18.0等の取得情報。

## 画像本体の取得（制作時）

保存済み画像集：`01-M1-Apple-Emoji.50pnqi.zip`
- library_file_id: `libfile_9ba86a820f988191960876561bac162d`
- file_id: `file_000000008e848206bbde2a331b0a98ca`
- bytes: 169049272

Libraryのprepare_materializeを`items:[{library_file_id:"libfile_9ba86a820f988191960876561bac162d"}]`で使い、現在のworkspaceへ取得する。返却された実パスを使用する。アップロード時のscratchパスは永続保存先ではない。約169MBあるため32MiB制限のdownload_fileを使わない。取得できなければ利用可能と偽らず、ユーザーへこのZIPの再添付を依頼する。フォント本体の取得は不要。

ZIP内の`M1-Apple-Emoji.50pnqi/`が素材ルート。manifestの`file`に対応するPNGだけをzipfile等で取り出せばよく、毎回全画像を展開する必要はない。ZIPに含まれるexport.swiftを実行する必要はない。

## 選択・合成

1. manifestをPython等で読み、emojiの完全一致または英語description・group・subgroupで絞り込む。全カテゴリを候補にし、添付写真や少数の定番に限定しない。
2. `file`はZIP内の素材ルートを基準に解決する。絶対scratchパスへ依存しない。文字のフォント代替表示ではなくPNG本体を合成する。
3. 候補を目視し、発話・症状・感情・医学的意味との一致を確認する。色・肌色・旗等から人物属性を推測しない。
4. 原画像と文字を保護し、音声に合わせて局所出現・移動・拍動・退場を付ける。種類と登場機会を積極的に増やすが、意味のない装飾は入れない。
5. 256px素材の過剰拡大を避け、必要な大きさで画質を確認する。利用動画に必要なPNGのみ作業フォルダへコピーする。

## 検証範囲

全3,548枚でPNGデコード、256×256、非空アルファ、透明領域、外周への接触なしを確認。全9カテゴリ各4枚を目視確認した。全画像の意味・見た目の個別目視は未実施なので、制作時に選択画像を必ず確認する。415件は書き出し時の複合グリフ判定等による保留であり、全てMac未対応だと断定しない。「全Apple絵文字搭載済み」と報告せず「3,548枚の実素材、415件保留」と区別する。

