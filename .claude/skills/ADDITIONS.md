# 原本バンドル外の追加スキル

既存64件の索引は [SKILL_INDEX.md](SKILL_INDEX.md)、状態は [REGISTRY.md](REGISTRY.md)。
本索引の追加分は旧MANIFESTの照合対象へ混ぜない。

現在のスキル総数は **71件**（原本バンドル64件 ＋ 本索引の追加7件）。

## 1. 制作基準を新規に起草したもの

| 名称 | 定義 | 追加日 | 区別 |
|---|---|---|---|
| 医療動画3 | [medical-video-3](medical-video-3/SKILL.md) | 2026-11-03 | 青の組織＋赤い血球、映画的な立体・反射・屈折 |

## 2. claude.ai 同期原本のミラー（2026-11-03 追加）

ご本人が claude.ai 側で運用しているスキルを、Codex／Claude Code からも使えるよう
`SKILL.md` をバイト単位でミラーしたもの。**内容はご本人の原本がすべて正本**。

| 名称 | 定義 | sha256（先頭12桁） | 用途 |
|---|---|---|---|
| CTスキル1 | [ct-skill-1](ct-skill-1/SKILL.md) | `ced56de08d3d` | CT・MRI断面を白黒×カラーで上下対比する縦型動画 |
| CTスキル2 | [ct-skill-2](ct-skill-2/SKILL.md) | `dd1d13702577` | スクロール＋「考える1.5秒」＋ナレーション |
| 動画CTスキル | [ct-mri-slice-video](ct-mri-slice-video/SKILL.md) | `775a23c50e54` | 病気／国試／先輩カードつきの断面縦型動画 |
| 医療動画の動かす予算 | [medical-video-motion-budget](medical-video-motion-budget/SKILL.md) | `e9d5e7c6c5a3` | 動かすのは臓器だけ。女の子のカットは動かさない |
| インフォグラフィック2 | [yakubon-infographic-2](yakubon-infographic-2/SKILL.md) | `b71dacf57e02` | 薬・ホルモン・細胞の擬人化キャスト版指示文 |
| SNSキャプション | [yakubon-sns-caption](yakubon-sns-caption/SKILL.md) | `31ebb3bdd700` | 絵文字つき500文字以内1ブロック |

同じ扱いの既存ミラー2件（[yakubon-infographic-c1](yakubon-infographic-c1/SKILL.md) /
[medical-3d-orbit-opener](medical-3d-orbit-opener/SKILL.md)）は原本バンドル64件の内数。

### ミラーの運用規則

- `SKILL.md` は**同期原本とバイト単位で一致**させる。内容の判断・要約・改善は行わない。
- 原本が claude.ai 側で更新されたら、ミラーも更新して台帳に記録する（§3-1-a の方式）。
- `agents/openai.yaml` は Codex 用の入口として**この環境で起草したもの**で、受領原本ではない。
  表示名・短い説明・呼び出し文だけを各 `SKILL.md` の記述から機械的に起こしている。
- **MANIFEST（原本324件）の照合対象外。** 母数・余剰判定に混ぜない。
- **動作確認は未実施**（手順書とCodex入口が揃った段階）。
