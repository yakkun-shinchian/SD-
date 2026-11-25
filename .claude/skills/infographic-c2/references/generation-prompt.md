# 1枚ごとの画像生成プロンプト

下の英語は1ページ分の原図用。角括弧を制作中のページの情報に置き換える。連作では視点・構造と色の対応を複写する。図が単純なページは拡大図や矢印を省いてよい。確定した日本語は見出し・質問・回答・ラベル・要点・フッターの順で組版用に手元に残す。

```text
Create ONE portrait 9:16 medical teaching illustration for a Japanese nursing infographic, target 1080 x 1920. Page [page] teaches [one learning goal].
Use an opaque, uniform pure black background, sRGB #000000, from edge to edge and in every empty area. No background gradient, navy tint, vignette, fog, or scattered light.

Show [anatomical structures and their spatial relationship] in [orientation, view, scale]. The body and organ walls are almost transparent. Use thin, softly shaded walls and a slightly firmer local edge where needed to separate overlapping layers. The learner must be able to trace [specific lumen, boundary or process]. Apply the muted seven-colour palette by structure only. For this page use [structure or substance = colour family + identifying shape]. Shade each structure within its assigned family. Keep the same mapping and anatomy as [series reference or previous page, if available]. Avoid rainbow washes, bloom, halos and decorative glass panels.

At the top reserve black space for a short title and one exchange. Draw two small friendly semi-realistic anime female nurses in navy V-neck scrubs, junior on the left with a bob and hairpin, senior on the right with tied-up hair. Leave room for a blue-edged question and a pink-edged answer. Give the main medical illustration about 60–65% of the canvas in the middle to lower region. Use [single cutaway / overview and adjacent detail / aligned comparison / ordered stages]. Reserve black space next to [specific structures] for later labels and at the bottom for the takeaway and footer.
Depict [mechanism or change]. For each medically required directional arrow use [start compartment → end compartment, one per arrow]; if none are specified, omit arrows. Keep [laterality, boundaries and page-specific medical constraints] accurate.

Deliver the artwork without lettering, numbers, placeholder glyphs, or a watermark. Reserve clean black areas for the final pale blue-white and silver-white editable type. Do not use yellow or gold lettering anywhere.
```

**Adobe組版**では、確定原稿を編集可能な文字レイヤーに置く。見出しは源ノ角ゴシック JP Bold、対話・本文・数値・ラベルは同 Medium。重要語は太さで示す。ページ番号・YAKUBON STUDIO・Clinical Infographic C2・「AI生成模式図」もこの段階で加える。

**文字入りの生成画像を明示的に依頼された場合**だけ、末尾の文字なし指示（最後の段落全体）を次に差し替える。画像に焼き込まれた文字はAdobe Fonts適用済みとして扱わない。

```text
Render only this approved Japanese copy, verbatim, in its assigned positions: [title / junior question / senior answer / labels and units / takeaway / brand, series, page and generated-diagram credit]. Use crisp Japanese gothic type, a bold pale blue-white title (#DCEBF5) and medium silver-white body, dialogue and labels (#CED8E1). Retain solid readable strokes on black. No yellow or gold text, text glow or decorative outlines. Do not invent or duplicate any text.
```
