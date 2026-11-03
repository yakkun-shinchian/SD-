# 冒頭黒画面の検出と明示的カット

PR #20 head d8f1a18 を基点に実装。音声 silencedetect とは独立して、
字幕を焼く前の字幕なしマスターの映像を検査します。

通常の build / subtitles コマンドで `black_report.json` を出力します。
既定は検出のみ。自動カットする場合だけ manifest 最上位に追加します。

```json
"leading_black": {"auto_cut": true}
```

```bash
python3 studio/mp4/edit.py build manifest.json --output-dir output
# black_report.json の検出区間・提案秒数を確認後、auto_cut を true に変更
python3 studio/mp4/edit.py subtitles manifest.json --output-dir output
```

- `detected_start/end`: カット前マスター時刻の連続黒区間。境界未検出時の end は検査できた位置。
- `boundary_found`: 最初の非黒フレームを確認したか。
- `proposed_cut_seconds`: 提案する削除秒数。
- `cut_seconds/cut_frames`: 実際の削除秒数・フレーム数。
- `status`: candidate / no_leading_black / protected。

## 保護ルール

縮小せず RGB 全画素を検査し、全チャネルが 4/255 以下かつ各画素の
チャネル差が 2 以下の場合だけ黒とみなします。暗さの平均値や黒画素の
割合は使いません。ネイビーの青成分、CT輪郭、明るい目印を保護します。
先頭からの連続黒だけが対象。最小0.2秒、最大3秒＋境界確認1フレーム。
非黒フレームが見つからない場合（全編黒・長い黒画面）は削除しません。
境界直前に黒を1フレーム残し、最初の非黒フレームを削除しません。
閾値を緩める設定は設けていません。

完全に黒に近い無彩色の医学画像や意図的な黒の演出は、画素だけでは
不要画面と区別できません。検出結果を確認してから有効化してください。
実際の脳ヘルニア・ヘルペス素材での目視確認は未実施です。

## 同期と再編集

`master.mp4` は未カットのまま保存します。`final.mp4` の映像をフレーム単位で
trimし、音声全体にも同じ秒数の atrim を適用、双方のPTSをゼロに戻します。
字幕は同じ秒数だけ前へ移動し、境界をまたぐ字幕をクリップします。
削除範囲にある音声・字幕も削除されます（ナレーションだけを残す機能ではありません）。
manifest の時刻や silence_check.keep は引き続き未カット時刻で指定します。
字幕再出力や自動カットの解除で二重カットせず、元素材がなくても保存マスターから再編集できます。

`captions.ass`、`subtitle_times`、`final_audio_ends`、`silence_report.json` と
`final_silence_report` は完成動画時刻。キャッシュの `silence_report` と
`audio_ends` は再利用用の未カット時刻です。設定値の時刻基準も明記しています。

## 検証

```bash
python3 -m unittest discover -s studio/mp4/tests -v
python3 -m unittest discover -s studio/tests -v
```

合成素材で、黒1秒→グレーの医学画像代替フレーム、ネイビー単色、
極暗青、黒なし、全編黒、長い黒、4×4白目印、音声立上り、字幕の移動・
境界クリップ・削除、無音レポート時刻、マスター再利用・カット解除を検証。
10fps・黒1秒のケースでは0.9秒削除、出力1.1秒、最初の非黒フレームを保持。
実動画の医学的内容を自動判定する機能ではありません。
