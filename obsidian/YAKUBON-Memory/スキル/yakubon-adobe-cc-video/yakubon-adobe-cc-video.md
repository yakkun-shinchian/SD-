---
skill: "yakubon-adobe-cc-video"
current_version: 1
skill_updated_at: "2026-11-24T13:01:02.123544Z"
skill_id: "skill_011rvQRvYQnbwdXXyQXxAh4s"
description: "YAKUBONの医療動画づくりで、Adobe（Photoshop・Illustrator・Premiere・Express・After Effects）をどの場面でどう使うかを決めるときに使う。"
tags:
  - "スキル"
  - "最新版"
---

> [!tip] 最新版 v1（2026-11-24）
> 変更点：[[yakubon-adobe-cc-video_変更履歴]] ／ 全版：「履歴」フォルダ ／ 一覧：[[スキル一覧]]

---
name: "yakubon-adobe-cc-video"
description: "YAKUBONの医療動画づくりで、Adobe（Photoshop・Illustrator・Premiere・Express・After Effects）をどの場面でどう使うかを決めるときに使う。"
---

# 医療動画でAdobeを使う（YAKUBON STUDIO）

Adobeには入口が2つある。まずどちらの仕事かを決める。

| 入口 | 使える場所 | できること |
|---|---|---|
| A. Adobeコネクタ（クラウド） | どのチャットでも（PCなしでよい） | 画像の調整、ベクター化、動画の形式変換・サイズ変更、声の聞きやすさ改善、Expressのデザイン、Stock、フォント |
| B. PCに入っているアプリ | Windows PCとつながっているチャットだけ | Photoshop・Illustrator・Premiere Pro・After Effects 本体をスクリプトで動かす |

## 最初に確かめること
1. `adobe_mandatory_init` を1回呼ぶ（Adobeの道具を使う前に必ず）。
2. `get_account_type` が `auth` か見る。`guest`・`noauth` なら、本人にAdobeコネクタをつなぎ直してもらう。
3. アカウントは **Googleでログインする shinsakuyakubo のほう**（「YA」で始まるほうではない）。どちらでつながっているかはClaudeからは見えないので、`asset_search`（CCAsset・新しい順）で最近のファイル名を出し、本人に見覚えがあるか聞く。ちがっていたら、本人にコネクタをつなぎ直してもらう（Claudeはログインできない）。

## A. コネクタでやる仕事（医療動画での使いどころ）
ファイルは、チャットに届いたもの・クラウド側で作ったものを `asset_initialize_file_upload` → PUT → `asset_finalize_file_upload` で上げる。PCの中のファイルは、いったんクラウド側へ持ってきてから上げる。

| 場面 | 道具 |
|---|---|
| イラストの明るさ・色みを整える | `image_apply_auto_tone`、`image_apply_adjustments`、`image_apply_preset` |
| 臓器だけ切り抜く（背景を消す） | `image_remove_background`、`image_select_subject` |
| 一部分だけ明るく・色を変える | `image_select_by_prompt` で選ぶ → 調整の道具 |
| 3:4などの絵を9:16に広げる | `image_generative_expand`（広げた所が黒になっているか必ず見る。黒でなければ使わず、黒で足す） |
| 切り抜き・サイズ変更 | `image_crop_and_resize` |
| 絵を線（SVG）にする | `image_vectorize` |
| Illustratorのファイルを PNG・PDF・SVG に出す | `document_render_vector` |
| 完成動画のサイズ・形式を変える（MP4・MOV・GIF） | `video_resize`、`video_export` |
| ナレーションの雑音を取って聞きやすくする | `media_enhance_speech`（速さは変えない。変わっていたら使わない） |
| 長い素材から見どころを集める | `video_create_quick_cut` |
| サムネイル・表紙・告知画像 | Expressの道具（`create_visual_design_express_skill` を先に読む） |
| 素材さがし・フォント | `asset_search`（StockAsset）、`font_recommend` |

動画・音声の道具は時間がかかる。「working」と返ったら、終わりの知らせを待つ（自分で何度も確かめに行かない）。

### コネクタではできないこと（先に本人へ伝える）
- After Effects の仕事はない
- 動画を秒で切る・つなぐ・タイムライン編集（いつもの pipeline か、PCの Premiere Pro で行う）
- 絵の生成、生成塗りつぶし、物を消す、背景を言葉で入れ替える、合成、高解像度化
- 20枚をこえる一括処理

## B. PCのアプリでやる仕事
**PCとつながっているときだけ。** つながっていなければ「このチャットはPCにつながっていません」と伝え、Aでできる分だけ進める。

初回は、次を調べて `C:\YAKUBON_STUDIO\CLAUDE.md` に「Adobeの章」として書く（調べる前に「使える」と言わない）。
1. 入っているアプリと場所（`C:\Program Files\Adobe\` の下。Photoshop・Illustrator・Premiere Pro・After Effects・Media Encoder）と版。
2. 動かし方を1つずつ小さく試す：
   - Photoshop・Illustrator：スクリプト（.jsx）を渡して開く→書き出す
   - After Effects：`aerender.exe` でプロジェクトを書き出す、`AfterFX.exe -r スクリプト` で組む
   - Premiere Pro：スクリプトで並べる、書き出しは Media Encoder
3. 試した結果（動いた・動かなかった・かかった時間）を `logs\kaizen.md` に残す。
4. スクリプトは `C:\YAKUBON_STUDIO\pipeline\adobe\` に置く。日本語のパスを含む .ps1 は BOM付きUTF-8 で保存する。

使いどころの目安：
- After Effects：線が描かれていく・数字が回る・粒が集まるなど、IRISで足りない動く演出を「ここぞ」の1か所だけ
- Premiere Pro：長い動画や、声と映像を細かく合わせ直したいとき
- Photoshop：絵の崩れ直しで Qwen-Image-Edit がうまくいかないとき、レイヤーを分けたいとき
- Illustrator：グラフ・線図（酸素解離曲線など）をきれいな線で作るとき

## いつもの決まりはそのまま守る
- 背景は純黒、テロップはエメラルド一色、文字は重ねない、声は速めない
- 絵そのものはClaudeが描かない（グラフは例外）
- 医学監修（`yakubon-medical-review`）をしてから仕上げる
- Adobeを使ったら、どのカットをどの道具で直したかを報告に一言入れる