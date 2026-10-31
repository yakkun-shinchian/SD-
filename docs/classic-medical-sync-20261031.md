# クラシック版 医学的内容同期 — 2026-10-31

対象: PR #22 / claude/sleepy-albattani-z4782h
確認した変更前HEAD: d46b62fedcb6a31825963bda00fc76c891593264

## 差分

- nurse-classic/scenes.js: 現行版で確定した医学的修正を移植（17行置換）。
- ナレーション8場面: anat03-1、anat04-1、anat04-2、anat04-4、anat05-2、anat05-4、base01-2、base01-3。
- 加えて anat04-3 の本文「心拍ダウン・血圧ダウン」を「心拍数は減少」に同期。ナレーション変更なし。
- 見出し・箇条書き・ナレーションは全118場面で現行版と完全一致。
- nurse-classic/data.js: anat03 / anat04 / anat05 / exam01 / exam02 の説明文だけ変更。換気と外呼吸・内呼吸・細胞呼吸の区別、臓器別の自律神経作用、ホルモン調節の例外と受容体、基準値の条件、輸液セット表示の確認を反映。V5/V6会話動画という説明は持ち込まない。
- index.html: 更新した2ファイルのキャッシュ更新用クエリのみ追加。
- 黒背景、CSS、app.js、figures.js、タイトル、durationSec、他のカタログ項目は変更なし。
- VOICEVOX書き出し・音声・manifestは変更なし。クラシック版音声マップは空で、端末読み上げを使う既存仕様を維持。

## 検証結果

1. `node tools/check-classic-content.mjs`: 合格。全118場面の対応・順序、見出し・本文・ナレーション一致、説明文のレビュー済み差分を検査。
2. 検出能力: anat03-1の本文だけを旧文へ戻した場合、現行版のanat03説明だけを変えた場合、ともに非ゼロ終了で検出。テスト後に復元し再合格。
3. カタログ比較: description以外の全項目が変更前と完全一致。
4. Playwright + Chromium Headless Shell 134: 320×844 / 390×844それぞれ118場面（計236場面表示）で見出し・箇条書き・字幕の内容一致、文字の切れ、横はみ出し、見出し/本文/字幕/操作バーと図の重なりを検査、すべて合格。ページのJSエラー0件。ライト設定でも背景rgb(15,15,15)。
5. 同ブラウザ・390px幅: Web Speechの即時onend、即時onerrorを模擬、さらに消音の3ケースを検査。再生1秒後は場面1のまま、anat03-1の字幕推定時間13.38秒に基づき場面2へ遷移。一時停止、前へ、次へも合格。
6. `git diff --check` と検証スクリプトの構文確認: 合格。

過去のPR記載の228項目とは別に今回実行した検証。iPhone/iPad実機・Safariおよび実音声の聴取検証は実施していない。医学的新規レビューではなく現行版の確定済み修正の同期。

## 継続チェック

`tools/check-classic-content.mjs` をGitHub ActionsのPR/対象ブランチpushで実行。
場面の追加・削除・順序や本文の差異をエラーにする。説明文は形式が違うため、両版の確認済みSHA-256を `tools/classic-description-review.json` に記録。片方の変更だけでも再レビューが必要になる。自動上書きやハッシュの無条件更新はしない。タイトル・表示時間は同期対象外。

モバイル検証の再実行: リポジトリをport 8000で配信し、Playwrightのある環境で `node tools/check-classic-mobile.cjs`。テスト環境に応じて `CODEX_PRIMARY_RUNTIME_NODE_MODULES` / `CHROMIUM_PATH` を指定できる。
