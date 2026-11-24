// After Effects 24+ / ExtendScript. Run directly for fonts and a visual check.
// build_v3.py embeds an audio-timed recipe in a copy of this file.
(function () {
    var job = /* @V3_JOB@ */ null;
    var headingFont = "SourceHanSerifJP-Bold";
    var c2HeadingFont = "SourceHanSansJP-Bold";
    var bodyFont = "SourceHanSansJP-Medium";
    var newItems = [];

    function fail(message) { throw new Error(message); }
    function own(item, folder) {
        newItems.push(item);
        if (folder) { item.parentFolder = folder; }
        return item;
    }
    function addBlackBackground(comp, folder) {
        var black = [0, 0, 0];
        comp.bgColor = black;
        var layer = comp.layers.addSolid(black, "背景｜純黒 #000000", comp.width, comp.height, 1, comp.duration);
        own(layer.source, folder);
        layer.startTime = 0;
        layer.inPoint = 0;
        layer.outPoint = comp.duration;
        layer.moveToEnd();
        layer.locked = true;
    }
    function fontByName(name) {
        if (!app.fonts) { fail("書体照合には After Effects 24.0 以降が必要です。"); }
        var found = app.fonts.getFontsByPostScriptName(name);
        for (var i = 0; i < found.length; i++) {
            if (!found[i].isSubstitute && found[i].postScriptName === name) { return found[i]; }
        }
        fail("AEに書体が見つかりません。Creative Cloudのフォントを同期してください。\n" + name);
    }
    function sourceText(layer) {
        var group = layer.property("ADBE Text Properties");
        return group ? group.property("ADBE Text Document") : null;
    }
    function applyToSelection(font) {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem) || !comp.selectedLayers.length) {
            fail("コンポジションで、書体を変更する文字レイヤーを選んでください。");
        }
        var props = [], originals = [], layers = comp.selectedLayers;
        for (var i = 0; i < layers.length; i++) {
            var prop = sourceText(layers[i]);
            if (!prop || layers[i].locked || prop.numKeys || prop.expressionEnabled) {
                fail("ロック、式、ソーステキストのキーフレームのない文字レイヤーを選んでください。\n" + layers[i].name);
            }
            props.push(prop);
            originals.push(prop.value);
        }
        try {
            for (i = 0; i < props.length; i++) {
                var doc = props[i].value;
                doc.fontObject = font;
                props[i].setValue(doc);
            }
        } catch (err) {
            for (var j = 0; j < i; j++) { props[j].setValue(originals[j]); }
            throw err;
        }
    }
    function underline(comp, name, box, color, start, end) {
        var height = box[3] - box[1];
        var thickness = Math.max(2, Math.round(height * 0.18));
        var y = box[3] + 1 + thickness / 2;
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.inPoint = start;
        layer.outPoint = end;
        var transform = layer.property("ADBE Transform Group");
        transform.property("ADBE Anchor Point").setValue([0, 0]);
        transform.property("ADBE Position").setValue([0, 0]);
        var vectors = layer.property("ADBE Root Vectors Group");
        var path = new Shape();
        path.vertices = [[box[0], y], [box[2], y]];
        path.inTangents = [[0, 0], [0, 0]];
        path.outTangents = [[0, 0], [0, 0]];
        path.closed = false;
        vectors.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape").setValue(path);
        var stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
        var paint = stroke.property("ADBE Vector Stroke Color");
        paint.setValue(paint.value.length === 4 ? color.concat([1]) : color);
        stroke.property("ADBE Vector Stroke Width").setValue(thickness);
        stroke.property("ADBE Vector Stroke Line Cap").setValue(2);
        stroke.property("ADBE Vector Stroke Opacity").setValue(45);
        var trim = vectors.addProperty("ADBE Vector Filter - Trim").property("ADBE Vector Trim End");
        // Keep even a one-frame cue visible on its first frame.
        if (end - start > comp.frameDuration * 2) {
            var draw = Math.min(0.30, (end - start) - comp.frameDuration);
            trim.setValueAtTime(start, Math.min(100, 100 * comp.frameDuration / draw));
            trim.setValueAtTime(start + draw, 100);
        } else { trim.setValue(100); }
    }
    function addSampleText(comp, value, font, size, x, y, fill) {
        var layer = comp.layers.addText(value), prop = sourceText(layer), doc = prop.value;
        doc.fontObject = font;
        doc.fontSize = size;
        doc.justification = ParagraphJustification.LEFT_JUSTIFY;
        doc.applyFill = true;
        doc.fillColor = fill;
        doc.applyStroke = false;
        prop.setValue(doc);
        var tr = layer.property("ADBE Transform Group");
        tr.property("ADBE Anchor Point").setValue([0, 0]);
        tr.property("ADBE Position").setValue([x, y]);
        var rect = layer.sourceRectAtTime(0, false);
        return [x + rect.left, y + rect.top, x + rect.left + rect.width, y + rect.top + rect.height];
    }
    function demo(isC2) {
        var title = fontByName(isC2 ? c2HeadingFont : headingFont), body = fontByName(bodyFont);
        var fill = isC2 ? [0.82, 0.89, 0.94] : [0.95, 0.97, 1.0];
        var name = isC2 ? "C2｜書体・下線の確認（無音見本）" : "YAKUBON｜書体・下線の確認（無音見本）";
        var comp = own(app.project.items.addComp(name, 1080, 1920, 1, 3, 30));
        addBlackBackground(comp);
        var a = addSampleText(comp, "観察のポイント", title, 86, 96, 780, fill);
        var b = addSampleText(comp, "いつから、何が変わった？", body, 54, 96, 951, fill);
        underline(comp, "見出し｜水色", a, [0.50, 0.87, 0.92], 0, 1.25);
        underline(comp, "本文｜水色", b, [0.50, 0.87, 0.92], 1.25, 3);
        comp.time = 0.65;
        comp.openInViewer();
    }
    function asset(path) {
        var absolute = /^(?:[A-Za-z]:[\\\/]|[\\\/]|~\/)/.test(path);
        var file = new File(absolute ? path : new File($.fileName).parent.fsName + "/" + path);
        if (!file.exists) { fail("素材がありません。\n" + file.fsName); }
        return file;
    }
    function importAsset(file, folder) {
        var options = new ImportOptions(file);
        options.sequence = false;
        return own(app.project.importFile(options), folder);
    }
    function build(data) {
        var pages = data.slides, files = [], i, j;
        var voiceFile = asset(data.audio);
        for (i = 0; i < pages.length; i++) { files.push(asset(pages[i].image)); }
        var folder = own(app.project.items.addFolder("YAKUBON V3｜" + data.part));
        var voice = importAsset(voiceFile, folder);
        if (!voice.hasAudio || voice.duration + 0.001 < data.lastSpeechMs / 1000) {
            fail("完成音声の尺・音声トラックを確認してください。");
        }
        var master = null;
        for (i = 0; i < pages.length; i++) {
            var page = pages[i], art = importAsset(files[i], folder);
            if (!art.mainSource.isStill || art.pixelAspect !== 1) { fail("正方形ピクセルの静止画を指定してください。\n" + page.image); }
            if (!master) {
                master = own(app.project.items.addComp(data.part, art.width, art.height, 1, data.durationMs / 1000, data.fps), folder);
            }
            // Use the full master timebase inside every precomp so cuts and
            // underline keys land on the same frames, even at fractional cuts.
            var scene = own(app.project.items.addComp(page.id, art.width, art.height, 1, data.durationMs / 1000, data.fps), folder);
            var still = scene.layers.add(art);
            still.startTime = 0;
            still.outPoint = scene.duration;
            addBlackBackground(scene, folder);
            for (j = 0; j < page.marks.length; j++) {
                var m = page.marks[j], b = m.box;
                if (b[0] < 0 || b[1] < 0 || b[2] > art.width || b[3] >= art.height) { fail("原図と文字座標を確認してください。\n" + m.line); }
                underline(scene, m.cue + "｜" + m.line, b, m.color, m.start / 1000, m.end / 1000);
            }
            var layer = master.layers.add(scene);
            layer.startTime = 0;
            layer.inPoint = page.start / 1000;
            layer.outPoint = page.end / 1000;
            var scale = 100 * Math.min(master.width / art.width, master.height / art.height);
            layer.property("ADBE Transform Group").property("ADBE Scale").setValue([scale, scale]);
        }
        var sound = master.layers.add(voice);
        sound.startTime = 0;
        if (voice.hasVideo) { sound.enabled = false; }
        sound.audioEnabled = true;
        sound.outPoint = Math.min(voice.duration, data.durationMs / 1000);
        sound.moveToEnd();
        addBlackBackground(master, folder);
        master.openInViewer();
    }
    function choose() {
        var w = new Window("dialog", "YAKUBON｜インフォグラフィック");
        var series = w.add("dropdownlist", undefined, ["C1・C3", "C2"]);
        series.selection = 0;
        var menu = w.add("dropdownlist", undefined, ["3秒の書体・下線見本を開く", "選択文字に見出し書体を適用", "選択文字に本文書体を適用"]);
        menu.selection = 0;
        w.add("statictext", undefined, "書体のPostScript名（文字に適用するときに変更できます）");
        var field = w.add("edittext", undefined, headingFont);
        field.characters = 32;
        field.enabled = false;
        function refreshFont() {
            field.enabled = menu.selection.index > 0;
            var title = series.selection.index === 1 ? c2HeadingFont : headingFont;
            field.text = menu.selection.index === 2 ? bodyFont : title;
        }
        menu.onChange = series.onChange = refreshFont;
        var buttons = w.add("group");
        buttons.add("button", undefined, "キャンセル", {name:"cancel"});
        buttons.add("button", undefined, "実行", {name:"ok"});
        if (w.show() !== 1) { return; }
        if (menu.selection.index === 0) { demo(series.selection.index === 1); }
        else { applyToSelection(fontByName(field.text)); }
    }
    app.beginUndoGroup("YAKUBON｜インフォグラフィック");
    try {
        if (!app.project) { app.newProject(); }
        if (job) { build(job); } else { choose(); }
    } catch (err) {
        for (var i = newItems.length - 1; i >= 0; i--) {
            try { newItems[i].remove(); } catch (ignored) {}
        }
        alert("インフォグラフィックを作成できませんでした。\n" + err.toString());
    } finally { app.endUndoGroup(); }
}());
