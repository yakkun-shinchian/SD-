# 心臓シリーズ ｜ 英語プロンプト集

1枚につき「共通ブロック」＋「術式・時点を示すブロック1つ」を使う。基準画像がある場合は添付する。新規の基準画像を作る場合は、制作メモで決めた視点・病型を加える。各例の変法・交通部・再灌流状態は明示的な作例条件であり、他の症例へ自動適用しない。

## 共通ブロック

```text
Create one portrait 9:16 medical teaching still. Place one main subject centrally against uniform pure black (#000000), with clear upper and lower margins. Render a translucent heart with thin organic walls, restrained surface light, distinct valve leaflets, lumens and vessel walls. Assign stable muted material colors by structure. Inside perfused lumens only, use a subtle warm tint for more oxygenated blood and a cool tint for less oxygenated blood. Show sparse biconcave erythrocytes, red to dark burgundy in both streams. Reserve intermediate tints for anatomically justified mixing. Keep junctions visible. When a sequence reference is supplied, match its patient laterality, camera, scale, apex, base, unaffected landmarks and cutaway plane exactly. Change only the specified anatomy and flow. Show only instruments named in the shot, with their access route and tip at the specified target. Keep the entire image free of text, pseudo-writing, numbers, symbols, arrows, labels, chemical identifiers, leader lines, engravings, scales, logos, watermarks, screens, waveforms and UI. No people in these anatomical views.
```

## Ross手術 ｜ フルルート置換、血流再開後

```text
Show the completed full-root Ross reconstruction in an anterior oblique cutaway after circulation resumes. Trace the left ventricular outflow through the patient's pulmonary autograft valve and root into the ascending aorta. Both reimplanted coronary buttons open into the new aortic root, with continuous proximal coronary lumens. Separately show the right ventricular outflow through a valved pulmonary homograft into the native pulmonary artery bifurcation. Keep both valve seats, conduit junctions and coronary origins discernible. Remove temporary instruments from this completed view.
```

**検品**　自己肺動脈弁は左室流出路、弁付き同種導管は右室流出路に各1つ。左右の冠動脈を新大動脈基部まで逆にたどる。両流出路を短絡させた絵は不合格。[Ross術式と再建図](https://pmc.ncbi.nlm.nih.gov/articles/PMC8690298/)

## 完全大血管転位 ｜ d-TGAの術前・術後を同じ正面像で比較

**術前**（心室中隔は保たれ、心房間交通を示す例）

```text
Create the frontal reference view of d-transposition with concordant atrioventricular connections and an intact ventricular septum. The morphologic right ventricle ejects into the aorta and back to the body. The morphologic left ventricle ejects into the pulmonary trunk and back to the lungs. Show these parallel circuits through the transparent walls. Show limited mixing through a patent atrial communication. Keep each downstream tint consistent with its inflow. Do not add a ventricular defect or a ductal connection to this example.
```

**動脈スイッチ後**（心房間交通を閉鎖し、血流を再開した例）

```text
Match the preoperative frontal reference. Keep the ventricles, atrioventricular valves and apex fixed. After the arterial switch, the left ventricle ejects through the native pulmonary valve and root into the reconstructed ascending aorta. Both transferred coronary origins open into this neo-aortic root. The right ventricle ejects through the native aortic valve and root into the reconstructed pulmonary arteries. Show continuous unobstructed lumens and separate systemic and pulmonary streams. The previously shown atrial communication is now closed. No temporary instruments.
```

**検品**　術前は右室→大動脈、左室→肺動脈。術後は左室→新大動脈、右室→新肺動脈。心室そのものを交換していないこと、冠動脈が新大動脈から起始することを別々に確認する。[米国心臓協会のd-TGA解説](https://www.heart.org/en/health-topics/congenital-heart-defects/about-congenital-heart-defects/d-transposition-of-the-great-arteries)

## フォンタン手術 ｜ 両方向グレン後の心外導管型TCPC、開窓なし

```text
Show completed nonfenestrated extracardiac total cavopulmonary connection in a frontal view of the reference single-ventricle anatomy. Preserve the existing bidirectional Glenn connection from the superior vena cava to the confluent branch pulmonary arteries. Trace inferior vena caval return through an extracardiac conduit outside the atrium into the pulmonary arterial confluence. Keep both branch pulmonary arteries patent. Neither caval stream passes through a pumping ventricle before reaching the lungs. Show pulmonary venous return separately entering the atrium and passing through the case-specific atrioventricular inlet to the functional systemic ventricle and systemic outflow. No conduit-to-atrium opening and no temporary instruments.
```

**検品**　上大静脈の既存グレン吻合と下大静脈の心外導管を個別に追跡する。導管が心房内を通る絵、肺循環の途中に心室ポンプを描いた絵はこの例では不合格。開窓例を指定された場合だけ導管と肺静脈側心房の小交通を加え、想定するシャントに応じて下流の混合を再評価する。[AHA科学声明・術式別の接続図（図1）](https://sbkf.barnlakarforeningen.se/wp-content/uploads/sites/17/2023/06/Evaluation-and-management-of-child-and-adult-with-Fontan-Circulation-Rychik-2019.pdf)
