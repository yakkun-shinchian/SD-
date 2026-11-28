---
skill: "yakubon-nurse-character-v2"
current_version: 1
skill_updated_at: "2026-11-09T20:31:20.705807Z"
skill_id: "skill_01LPDwSsvXrcR7TbM7nmKPig"
description: "YAKUBON STUDIOの医療動画1・2・3に看護師の女の子を出すときの固定キャラ（茶髪の低いおだんご・濃紺スクラブ・面長で上品なセミリアル寄りアニメ絵）。チャッピーへの指示・Qwenでの修正・確認に使う。"
tags:
  - "スキル"
  - "最新版"
---

> [!tip] 最新版 v1（2026-11-09）
> 変更点：[[yakubon-nurse-character-v2_変更履歴]] ／ 全版：「履歴」フォルダ ／ 一覧：[[スキル一覧]]

---
name: "yakubon-nurse-character-v2"
description: "YAKUBON STUDIOの医療動画1・2・3に看護師の女の子を出すときの固定キャラ（茶髪の低いおだんご・濃紺スクラブ・面長で上品なセミリアル寄りアニメ絵）。チャッピーへの指示・Qwenでの修正・確認に使う。"
---

# 医療動画1・2・3の看護師キャラクター（v2）

2026-11-07 にシンサクさんが決定（CHARACTER REFERENCE v2：三面＋表情8種）。2026-11-10、顔と画風のお手本を追加。

## お手本画像（PC：Windows）
- 顔・画風の第一基準（2026-11-10）：`C:\YAKUBON_STUDIO\characters\nurse_v1\approved_20261110_face\face_ref_brain.png`（光る脳を両手で包む）、`face_ref_monitor.png`（病室でモニターを見る）
- 髪型・服・全身・表情の基準：`C:\YAKUBON_STUDIO\characters\nurse_v1\illustration_v2\character_reference_v2_4K.png`（正面・左右横・後ろ、表情8種）
- 古い `approved_20261107_1to3\keyvisual.png`（丸顔で可愛い寄り）は、顔のお手本に使わない

## 使う範囲
- 医療動画1・2・3：使う（人物を出すと決めたカットだけ。1カット1人）
- インフォグラフィックC1・M3、Instagram V6・V7：使わない（ボブの子など各スキルのキャラのまま）

## 見た目の固定条件
- 20代の日本人女性看護師。面長で上品な顔立ち、温かい茶色の目（自然な大きさ、長めのまつ毛）、口を閉じたやさしい微笑み
- 髪：こげ茶。横に流した長めの前髪、顔まわりの後れ毛、後ろで低いおだんご（三つ編みが入ってもよい）
- 服：濃紺のVネック半袖スクラブと濃紺のパンツ、左胸にリール付きの白い無地の名札、白いナースシューズ
- 画風：上品なセミリアル寄りのアニメ調イラスト。やわらかい絵画的な陰影、きれいな線。
  - しないこと：写真・実写風、リアルな肌の質感、欧米人風の顔、丸顔の可愛い寄りデフォルメ、ちびキャラ、キラキラの大きな目
- 光：医療動画側の青い光を顔・手・スクラブにやわらかく映り込ませる。人物にガラスの質感はかけない

## チャッピーに頼むとき
- お手本画像（face_ref_brain.png と CHARACTER REFERENCE v2）を**毎回チャットに貼る**。名前やスキル名だけで頼まない（チャッピー側でスキルが外れると、実写の白人風になる。2026-11-10に起きた）
- 指示文に入れる英語：
  "Use the attached images as the exact identity: a young Japanese female nurse with a slim oval face, refined gentle features, warm brown eyes, long side-swept bangs with loose strands, dark brown hair tied in a low bun, navy V-neck short-sleeve scrubs and navy trousers, a blank white ID badge on a reel on the left chest, white nurse shoes. Refined semi-realistic anime illustration with soft painterly shading. Not a photograph, no realistic skin texture, not Western, not chibi. Only one person. No text."

## 顔がずれたときの直し方（PC・無料）
- ComfyUIの Qwen-Image-Edit-2511 で、画像1＝ずれた絵、画像2＝face_ref_brain.png にして「image 2 の女性と同じ顔・髪型・画風に。ポーズ・構図・背景は image 1 のまま」と指示する
- 動画化（LTX-2.3）のネガティブに photorealistic, realistic skin, western face を入れ、ポジティブに「イラストの画風を保つ」を入れる

## 確かめること
- お手本と並べて、顔（輪郭・目・前髪）、おだんご、濃紺スクラブ、名札、白い靴が同じか
- 実写化・白人風・丸顔の可愛い寄りになっていないか
- 1カット1人、文字なし