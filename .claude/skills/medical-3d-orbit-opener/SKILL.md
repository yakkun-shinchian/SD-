---
name: "medical-3d-orbit-opener"
description: "YAKUBON STUDIOの医療ショート動画で、冒頭0〜3秒に病変・臓器を3Dで回り込み（正面→側面→背面）見せる掴みカットの静止画・動画プロンプトを作るときに使う。"
---

# 医療ショート：3Dオービット・オープナー

伸びた実績：フローダイバーター治療動画（冒頭2秒で脳動脈瘤の周囲をカメラが回り込む）。
この「冒頭で立体を見せる」型を、どの題材でも再現できるようにするスキル。

## なぜ効くか（企画書・説明に使える根拠）
- 運動視差：カメラが動くと奥行きが生まれ、平面の画面でも「本物の立体」と知覚される → 最初の1〜2秒で親指が止まる
- 好奇心ギャップ：裏側がちらっと見えると「どうなってるの？」が生まれ、続きを見たくなる
- 臨床的必然性：実臨床でも3D回転血管撮影（3D-RA）でネックと親血管の関係を確認してから作業角度を決める。冒頭オービットはその再現であり、演出ではなく教育になる

## 対象になる題材
形・位置関係が理解の鍵になるもの：脳動脈瘤（ネック・ドーム・親血管）、心臓弁（大動脈弁・僧帽弁）、冠動脈の分岐、椎骨・椎間板、腎結石と尿管、腫瘍と周囲血管、気管支の分岐 など。

## 構成（縦9:16、冒頭0〜3.5秒）
| 時間 | カメラ | 見せるもの |
|---|---|---|
| 0.0–0.8s | 正面 | 全体像（タイトルテロップ固定） |
| 0.8–1.6s | 側面へ回り込み | ネックの幅・親血管からの立ち上がり |
| 1.6–2.4s | 背面（親血管が手前を横切る） | 奥行き・裏側 |
| 2.4–3.5s | 本編の作業角度へ戻る | ここで本編の最初のコマと一致させる |

- 回転は180〜270°まで。3秒で360°は速すぎてAI動画が破綻しやすい
- 被写体は静止、動くのはカメラだけ（形が変形しないように）
- 中の赤血球だけはゆっくり漂ってよい

## 最重要ルール：途中で絵柄を変えない
過去作で、2秒付近のクロスフェードで質感が変わり（壁の赤み、赤血球の大きさ、背景の血管網）、「別動画に切り替わった」印象になった。
- 全カットで **同じ参照画像（ヒーロー画像）** を使う
- 色・質感・赤血球サイズ・背景を固定する語句を、毎回プロンプトにそのまま入れる
- 回り込みの **最終フレーム ＝ 本編の開始フレーム**。Veo／Seedanceの「最初と最後のフレーム指定」が使えるなら必ず使う
- つなぎはカットかごく短いディゾルブ（0.2秒以内）。長いクロスフェードは二重像に見える

## 作業の流れ（役割分担）
Claudeが指示文を書き、チャッピー（ChatGPT）は静止画の実行役、Veo／Seedanceは動画の実行役。動画プロンプトは必ずClaudeが書く。

1. **ヒーロー画像**（本編の作業角度の1枚）をチャッピーで作る。手技パートと共通の基準画像になる
2. **4方向ターンアラウンドシート**をチャッピーで作る（下のテンプレA）
3. **オービット動画**をVeo／Seedanceで作る（テンプレB）。最初のフレーム＝シートの正面、最後のフレーム＝ヒーロー画像
4. 動画が破綻したら **代替案**：シートの4枚を0.6秒ずつのカットでつなぎ、各カットにゆっくりしたズームを付ける（テンプレC）
5. テロップは上にタイトル、下に副題。被写体は画面中央60%に置き、上下はテロップとSNSのUI用に空けておく

## テンプレA：ターンアラウンドシート（チャッピー向け）
```
Create a 2x2 turnaround reference sheet of ONE identical 3D medical model:
[SUBJECT — e.g. a saccular cerebral aneurysm arising from a gently curved parent artery, with a clearly visible neck].
Panels: top-left FRONT view, top-right LEFT SIDE view (90°), bottom-left BACK view (180°), bottom-right TOP-DOWN view.
The model, proportions, lighting and materials must be exactly the same in every panel; only the viewing angle changes.
Style (keep fixed): translucent glass-like vessel wall, cool blue rim light, soft inner glow, deep navy background,
small biconcave blood cells floating inside rendered in pale blue, no reddish tint, no background vessels.
Anatomically plausible: neck width, dome shape and parent-artery relationship consistent across all views.
No text, no labels, no arrows, no watermark.
```

## テンプレB：オービット動画（Veo／Seedance向け、3〜4秒）
```
Vertical 9:16, 3.5 seconds, one continuous shot, no cuts.
Slow, smooth cinematic orbit camera moving about 200 degrees around a perfectly still 3D model of [SUBJECT].
Start frame: front view (reference image 1). The camera arcs to the side, passes behind so the parent artery crosses the foreground,
then settles on the final angle that matches reference image 2 exactly.
The model never changes shape, size or material. Only the camera moves. Blood cells drift gently inside.
Keep fixed: translucent glass-like vessel wall, cool blue rim light, deep navy background, pale blue blood cells, no reddish tint.
Subject stays centered in the middle 60% of the frame; empty space at top and bottom.
No text, no morphing, no zoom jumps, no flicker.
```

## テンプレC：代替（静止画4枚のカット割り）
- 正面 → 側面 → 背面 → 作業角度、各0.6秒
- 各カットで102%→106%へゆっくりズーム、回転方向にわずかに横移動（回っている錯覚が出る）
- 切り替えは0.1〜0.15秒のディゾルブ

## 仕上げチェック
- [ ] 0〜3秒で絵柄・色・赤血球サイズが一度も変わっていない
- [ ] 側面の視点でネックの幅（瘤の入口）がはっきり見える
- [ ] 背面で親血管が手前を横切り、奥行きが出ている
- [ ] 回り込みの最後のコマと本編の最初のコマが一致している
- [ ] 形の解剖学的な整合性：各視点で瘤と親血管の位置関係に矛盾がない
- [ ] テロップが被写体に重なっていない