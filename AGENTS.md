# AGENTS.md — YAKUBON STUDIO 共通エージェント申し送り

このファイルは **Codex / Claude Code / その他のコーディングエージェント共通**の入口です。
Claude Code 用のリポジトリ規約は `CLAUDE.md`、スキル定義は `.claude/skills/` にあります。

## 0. 最初に読むもの

| 目的 | ファイル |
|---|---|
| **スキル台帳・対応表・未発見一覧** | `.claude/skills/REGISTRY.md` ← **まずこれ** |
| 制作スキル定義（正本のミラー） | `.claude/skills/*/SKILL.md` |
| リポジトリ構造・NurseTube仕様 | `CLAUDE.md` |
| 利用者向けドキュメント | `README.md` |

## 1. 共有スキル定義

`.claude/skills/` 配下を **Codex でもそのまま読み込んでください**（Markdown なので追加ツール不要）。

| スキル | 用途 |
|---|---|
| `yakubon-infographic-c1` | 看護教育リール用 Clinical Infographic C1 指示文の生成 |
| `medical-3d-orbit-opener` | 医療ショートの冒頭0〜3.5秒、3D回り込み（オービット）カットの指示文生成 |

> これらは claude.ai 同期スキルの **改変なしミラー**です（sha256照合済み）。
> 内容を変更する場合は、必ず原本側と合わせてください。勝手な上書き・統合はしないこと。

## 2. 役割分担

**Claude（企画・検証）**
- スキル探索、制作企画、ナレーション原稿、医学的内容の検証、制作指示、完成品の品質レビュー

**Codex（ファイル処理・レンダリング）**
- 画像・動画のファイル処理、ffmpeg による編集、音声と字幕の結合、エンコード
- 解像度・縦横比の検証、無音検査、完成MP4の出力

## 3. 動画・音声の共通制作ルール

- 原則 **縦9:16（1080×1920）**。可能な範囲で2K以上、必要時4K
- **冒頭に不要な無音を入れない**（既存V6は各ページ先頭0.35秒のみ、発話間0.28秒）
- ナレーションと字幕を同期させる。医学的に重要な画像を字幕で隠さない
- 字幕は画面上部など適切な位置へ。被写体は画面中央60%、上下はSNSのUI用に空ける
- 音声速度は必要に応じて約1.3倍。**音程は不自然に変化させない**
- 立体CG・CTの重要場面は十分な表示時間を確保
- 動画の尺は **30〜60秒を基本**に内容に応じて調整（既存V6実績は84秒）
- 1カット1動作。急激なズームや不要なカメラ切替を避ける
- 一連のカットで同一の血管形状・臓器位置・カメラアングル・色・照明・質感を維持
- 男性人物や実在人物の顔を不用意に追加しない
- 文字やラベルは指定がなければ画像に直接入れない
- CT・MRIは教育用画像と実際の診断画像を区別する。**存在しない解剖構造や病変を加えない**

## 4. 出力後の必須検品（Codex担当）

既存 `exam0*-v6-render.py` と同じ水準で検証してください。

```bash
# 解像度・fps・コデック
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,codec_name -of csv=p=0 OUT.mp4
# 音声
ffprobe -v error -select_streams a:0 \
  -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 OUT.mp4
# 冒頭・途中の無音検査
ffmpeg -v info -i OUT.mp4 -af silencedetect=noise=-50dB:d=0.2 -f null -
# 全走査デコード（破損検出）
ffmpeg -v error -i OUT.mp4 -f null -
```

エンコード設定は既存V6に合わせる：
`-c:v libx264 -preset veryfast -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -ar 48000 -movflags +faststart`

## 5. 禁止事項

- `.claude/skills/` の既存スキルを **削除・統合・無断上書き** しない
- 実体のないスキルを **推測で新規作成** しない（未発見は `REGISTRY.md` §3 に残す）
- テストを無効化・スキップして「通った」ことにしない
- 確認できていないことを「完了」として報告しない

## 6. Git

- 作業ブランチはタスクごとの指定に従う。なければローカル作成
- コミットメッセージは日本語（既存履歴に合わせる）
- `git push -u origin <branch>` → ドラフトPR作成
- 本リポジトリは静的サイト。GitHub Pages（rootフォルダ）でそのまま公開される
