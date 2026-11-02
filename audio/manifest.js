/* 音声ファイルの対応表です。
 * いまは空なので、各番組は端末の音声合成（読み上げ）で再生されます。
 *
 * VOICEVOX等で音声を作って tools/link-audio.mjs を実行すると、
 * ここに { "番組ID-シーン番号": "audio/xxx.wav", ... } が自動で入り、
 * アプリがその音声ファイルで再生するようになります（手順は voicevox/README.md）。
 */
const AUDIO_FILES = {};
