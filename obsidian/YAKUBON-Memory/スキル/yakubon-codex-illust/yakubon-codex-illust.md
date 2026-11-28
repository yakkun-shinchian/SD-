---
skill: "yakubon-codex-illust"
current_version: 1
skill_updated_at: "2026-11-27T00:36:41.600134Z"
skill_id: "skill_016q5vrcLgY8Jwkt2bhddaHM"
description: "YAKUBONの医療動画のイラストを、PCのCodex（codex exec）に描かせ、Claudeが指示・確認・直し・最終チェックをするときに使う。"
tags:
  - "スキル"
  - "最新版"
---

> [!tip] 最新版 v1（2026-11-27）
> 変更点：[[yakubon-codex-illust_変更履歴]] ／ 全版：「履歴」フォルダ ／ 一覧：[[スキル一覧]]

---
name: "yakubon-codex-illust"
description: "YAKUBONの医療動画のイラストを、PCのCodex（codex exec）に描かせ、Claudeが指示・確認・直し・最終チェックをするときに使う。"
---

# Codexに絵を描かせて、Claudeが仕上げる（YAKUBON STUDIO）

2026-11-27 シンサクさん指示。これからの医療動画のイラストは、PCのCodexに描いてもらう。Claudeは、指示を書く・できた絵を確かめる・直しを頼む・動画に組み立てる・最終チェックをする、を受け持つ。

## 役割
- **Codex**（Windows PCの Codex CLI）：画像生成ツールで絵を描き、作品フォルダの images\ に保存する。動画は作らない。
- **Claude**：カットごとの指示文を書く → Codexに渡す → できた絵を見て確かめる → 直しの指示を出す → 合格した絵をComfyUI・Klingで動画にする → テロップ・引き出し線・Tips → 医学監修（yakubon-medical-review）→ 最終チェック → 納品。

## 道具（PC）
- `C:\YAKUBON_STUDIO\pipeline\codex_image.ps1`（BOM付きUTF-8）
  - `powershell -NoProfile -ExecutionPolicy Bypass -File codex_image.ps1 -Work <作品フォルダ> -Out <保存名.png> -Prompt <指示ファイル.txt> -Refs images\参照.png`
  - 中身は `codex exec --skip-git-repo-check --approve-for-me -C <作品フォルダ> -i <参照画像>` に、指示を**標準入力**で渡す。
  - 結果は `<作品フォルダ>\images\<保存名>.png`、記録は `<作品フォルダ>\codex_<保存名>.log`（最後に保存パスと exit=0）。
  - 1枚あたり約3〜4分。待ち時間に次の指示を書いておく。
- つまずいた点（2026-11-27）：
  - `--full-auto` はこの版（codex-cli 0.170）にはない。`-s` と `--approve-for-me` は一緒に使えない → `--approve-for-me` だけにする。
  - `-i` は後ろの引数を全部画像として読むので、指示を引数に置くと「No prompt provided」になる → 指示は標準入力で渡す。
  - 指示ファイルは作品フォルダに置く（device_commit_files は書いた直後だと古い中身が届くことがあるので、少し待ってから送り、PC側で中身を確かめる）。
- Codexは本人のChatGPTのプランで動く。OpenAI APIの残高は使わない（2026-11-27時点でAPIの残高は切れている）。

## 指示文の書き方
- これまでのチャッピーへの指示と同じ決まりで書く（iryo-douga-1-illust-script、yakubon-procedure-motion-first）。
  - 最初に「画像生成ツールで、イラストを1枚描いてください（ChatGPTの『医療動画2』の絵柄：…）」と書く。
  - 「イラストだけ。動画は作らない」「縦長9:16。文字・数字・記号・矢印・ラベルは一切入れない」を毎回入れる。
  - 1カット＝1ファイル。毎回最初から全部書く（前の絵を参照する書き方をしない）。
  - 同じ構図にしたいときは、その絵を -Refs で添付し、「添付の絵と同じ向き・同じ大きさ・同じ絵柄」と書く。
  - 色は指定しない（酸素の多い血と少ない血が見分けられるように、だけは書く）。赤血球はすっきり。
- 直しの指示は「直すところは1つだけ」と書き、変えないもの（絵柄・向き・大きさ・器具）をはっきり書く。直す前の絵を -Refs で添付する。

## 確かめること（Claudeが毎回見る）
1. 開ける画像か、縦9:16か、四隅が純黒か
2. 文字・数字・矢印が入っていないか
3. 同じシリーズのほかの絵と、絵柄・向き・大きさがそろっているか
4. 解剖と器具が医学的に正しいか（例：経皮的肺動脈弁留置のカテーテルは下大静脈から入る）
5. 血管・器具が増えていないか、人が出てはいけないカットに出ていないか
- 合格しなければ、直しの指示を書いてもう一度描かせる（目安は2回まで。3回目で直らなければ本人に相談するか、クリエイティブクローのGPT Image 2.6をクレジットで使う）。
- 同じカットが2枚あるときは、合格した方を使い、前の絵は `_codex1` などの名前で残す。

## そのあと
- 合格した絵は images\<カット>.png に置き、ComfyUI（illust3s.py）・Klingで動画にする。
- 動画の組み立て・医学監修・最終チェック・キャプション・納品は、これまでのスキル（yakubon-medical-video-assembly、yakubon-medical-review、yakubon-sns-caption）どおり。
- 報告では、どのカットをCodexが描いたか、何回直したかを一言添える。