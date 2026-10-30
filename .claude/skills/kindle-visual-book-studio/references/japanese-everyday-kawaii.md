# Japanese Everyday Kawaii — Kindle photobook brief

Use this edition brief to create an AI-image photobook that helps an international audience feel the quiet forms of Japanese `kawaii`: not only cuteness, but warmth, sincerity, grace, playfulness, delicacy, and beauty found in ordinary life.

## Core promise

Show fictional adult Japanese women in unforced daily moments. Let beauty emerge from a small gesture, a passing expression, soft light, weather, clothing, space, and human presence rather than from glamour, spectacle, or sexual display.

Aim for three simultaneous qualities:

- **Kawaii:** approachable warmth, a gentle smile, absorbed concentration, small delight, or playful imperfection.
- **Beauty:** dignity, balance, individuality, and emotional truth rather than cosmetic perfection.
- **Transparency:** clear natural light, restrained color, breathable composition, realistic skin, quiet atmosphere, and a sense of fresh air.

Do not translate `kawaii` as merely “cute.” In the introduction, explain it as a relational feeling: something that invites tenderness, closeness, and care.

## Default decisions

When the user leaves details open, state and use these defaults without turning every choice into a blocking question:

| Decision | Default |
|---|---|
| Audience | Adults outside Japan who enjoy Japanese culture, lifestyle photography, and gentle visual storytelling |
| Subjects | Distinct fictional Japanese women, all unmistakably 20 or older |
| Visual mode | Photorealistic-natural editorial photography with subtle cinematic softness |
| Master edition | Print-first portrait layout, adapted separately for a fixed-layout or otherwise suitable Kindle edition |
| Content length | 50 principal images plus front matter and restrained back matter |
| Language | Natural English first, with short Japanese titles or phrases where they add meaning |
| Page design | One principal image and one brief caption per content page; no text generated inside the artwork |
| Emotional arc | Dawn and freshness → social warmth and movement → solitude and reflection → evening calm and hope |

Offer anime-illustration or hybrid treatment only when the user requests it. Do not silently mix photographic and illustrated modes in one edition.

## Creative guardrails

- Depict adults only. Avoid school uniforms, child-coded styling, childlike proportions, infantilizing poses, and ambiguous age.
- Keep the camera empathetic and at human eye level. Avoid voyeuristic angles, fetish framing, cleavage emphasis, underwear focus, wet-clothing emphasis, and fragmented body crops.
- Use attractive, expressive subjects without forcing one standardized face, skin tone, body type, hairstyle, or personality to represent Japan.
- Convey Japanese context through an internally coherent setting, season, objects, clothing, and caption. Do not claim nationality from facial features alone.
- Balance Tokyo and major-city scenes with suburban, coastal, regional, and domestic moments. Avoid reducing Japan to neon streets, cherry blossoms, kimono, geisha imagery, or anime clichés.
- Use kimono, yukata, festivals, shrines, or tea ceremony only when historically and contextually appropriate; do not treat ceremonial imagery as ordinary daily wear.
- Preserve modest realism: skin texture, flyaway hair, imperfect weather, ordinary rooms, and lived-in objects. Avoid plastic skin, excessive whitening, oversized eyes, and beauty-filter anatomy.
- Keep brands, logos, copyrighted characters, celebrity likenesses, readable commercial signage, watermarks, and artist imitation out of generated images.
- Describe the collection honestly as AI-generated visual art. Never market fictional subjects as documentary portraits of real women.

## Build the page manifest

Create the general manifest fields in `production-checklist.md`, then add these edition fields:

| Field | Purpose |
|---|---|
| `moment` | The small action or human beat that carries the page |
| `life_sphere` | home / commute / work / errand / friendship / hobby / nature / rest |
| `season_weather` | Season, temperature, weather, and atmospheric cue |
| `time_light` | Time of day and physically plausible light source |
| `person_profile` | Adult age band, hairstyle, clothing, temperament, and distinguishing traits |
| `kawaii_note` | Why the moment feels endearing without being childish |
| `transparency_note` | Light, palette, depth, air, and texture choices |
| `international_bridge` | What a reader unfamiliar with Japan can understand or learn |
| `similarity_check` | Face, pose, outfit, setting, and composition overlaps with nearby pages |

Before writing image prompts, create a variation matrix. Across the whole book, deliberately vary:

- age bands within adulthood, face shapes, skin tones, body builds, hairstyles, eyewear, and personal style;
- introverted, lively, thoughtful, capable, mischievous, tired, serene, and quietly confident moods;
- home, transit, workplace, local shops, cafés, libraries, parks, waterfronts, neighborhood streets, and regional landscapes;
- spring, humid summer, rain, autumn wind, winter air, morning, midday, blue hour, and warm indoor evening;
- close portrait, medium environmental portrait, full-body scene, over-shoulder observation, reflection, and detail-led composition.

Do not let “variety” become a checklist of stereotypes. Each page must still feel like one plausible person living one coherent moment.

## Scene families

Distribute a 50-image edition across these families rather than repeating café portraits:

1. **Morning softness:** opening curtains, tying hair, making tea, watering a plant, choosing earrings, stepping into fresh air.
2. **Movement through the day:** waiting for a local train, walking with an umbrella, cycling beside a river, pausing at a crossing, carrying groceries.
3. **Attention and craft:** reading, writing, cooking, mending, arranging flowers, practicing an instrument, concentrating at work.
4. **Shared warmth:** laughing with a friend, offering food, greeting a shopkeeper, helping someone, sharing shelter from rain.
5. **Small delight:** finding a favorite pastry, seeing the first seasonal flower, winning a capsule toy, petting a cat, noticing sunlight on a wall.
6. **Quiet solitude:** looking through a window, listening to music, resting after work, walking at dusk, sitting near the sea.
7. **Season and place:** wind in early spring, rainy-season reflections, summer shade, autumn leaves, winter breath, regional textures.
8. **Evening grace:** removing shoes at home, preparing a simple meal, folding laundry, balcony air, bedside reading, lights fading outside.

Keep background people secondary and visually indistinct unless the page concept explicitly centers a relationship.

## Write image prompts

Write one prompt per page using this order:

```text
Use case: photorealistic-natural
Asset type: full-page Kindle/KDP lifestyle-photography artwork
Primary request: <one adult woman in one small, emotionally legible daily moment>
Subject: <fictional Japanese adult; explicit age 20+; individual appearance, clothing, posture, expression>
Scene/backdrop: <specific contemporary Japanese location with coherent objects, season, and weather>
Action: <one natural action, not a beauty pose>
Composition/framing: <camera distance, angle, lens feeling, negative space, safe area for trim and gutter>
Lighting/mood: <physically plausible source; airy clarity; emotional tone>
Color/materials: <restrained palette; realistic skin, hair, fabric, glass, wood, rain, or paper texture>
Narrative note: <why this ordinary moment feels kawaii and universally human>
Constraints: adult subject; believable anatomy; original fictional identity; culturally coherent setting; no embedded text
Avoid: sexualized framing, child-coded styling, celebrity likeness, copied character, logo, watermark, legible gibberish signage, plastic skin, oversized eyes, extra fingers, fused hands, duplicated objects, warped reflections
```

Use ordinary camera language rather than stacking fashionable adjectives. Favor a believable image with one emotional center over a prompt crowded with symbols.

### Sample page prompt

```text
Use case: photorealistic-natural
Asset type: full-page Kindle/KDP lifestyle-photography artwork
Primary request: a quiet rainy-morning portrait of an adult woman noticing that one hydrangea has opened
Subject: a fictional 29-year-old Japanese woman with a short natural bob, light freckles, a pale blue cotton shirt, loose charcoal trousers, and a softly surprised half-smile
Scene/backdrop: the narrow entry garden of a modest contemporary home in Kamakura; wet stone, one clear umbrella, hydrangea leaves, no visible brand or readable sign
Action: she has paused while fastening one shoe and leans slightly toward the flower; candid, not posing for the camera
Composition/framing: vertical environmental portrait, human eye level, gentle 50 mm lens feeling, full hands visible, breathing room above and beside her, important details away from trim and gutter
Lighting/mood: overcast daylight reflected from wet stone, luminous skin without whitening, clean cool air, intimate and hopeful
Color/materials: rain-washed blue, leaf green, charcoal, realistic cotton, damp hair, stone, and translucent umbrella
Narrative note: kawaii comes from her unguarded moment of discovery, not from childish styling
Constraints: unmistakably adult; believable anatomy; original fictional identity; contemporary Japanese setting; no embedded text
Avoid: glamour pose, school styling, sexualized framing, celebrity likeness, logo, watermark, gibberish lettering, plastic skin, oversized eyes, extra fingers, fused hands, duplicated umbrella, warped reflections
```

## Write captions for international readers

Use an evocative English title of two to six words, an optional short Japanese phrase, and a 20-45-word English caption. Let the caption illuminate the feeling or cultural context without explaining the photograph to death.

Caption rules:

- Write clear contemporary English and avoid exoticizing words such as “mysterious Orient,” “submissive,” or “porcelain doll.”
- Explain a Japanese custom only when it actually matters to the scene, and verify factual claims from reliable sources.
- Keep invented inner thoughts out unless the book is explicitly fictional narration.
- Do not name a fictional location, garment, or custom as factual if the image prompt did not establish it reliably.
- Place citations and source notes in back matter, not over the image.

Example:

> **The First Bloom — 最初の一輪**
>
> On a rainy morning, one newly opened hydrangea is enough to interrupt the rush. Here, kawaii is not childishness; it is the small tenderness that appears when attention slows down.

## Cover and positioning

Build the cover separately from the interior artwork. Reserve clean negative space and add all typography in the layout stage, never inside the generated image.

Generate title options that can travel naturally in English. Favor emotional clarity over keyword stuffing. Useful directions include:

- `Everyday Kawaii: Quiet Beauty in Japanese Life`
- `Kawaii in the Ordinary: Small Moments, Soft Light, Japan`
- `Softly, Japan: Women, Light, and the Beauty of Everyday Life`

Do not use `photographs`, `documentary`, or wording that implies real photographed models if every subject is AI-generated.

## Quality review

Reject or revise a page when any of the following is true:

- the subject's age is ambiguous or child-coded;
- the image is attractive only because of sexualized framing or exaggerated anatomy;
- faces, poses, outfits, or scenes look duplicated across the collection;
- a supposedly ordinary scene is culturally incoherent, theatrical, or dominated by clichés;
- hands, teeth, ears, glasses, jewelry, umbrellas, chopsticks, reflections, shadows, or background bodies are malformed;
- skin is unnaturally bleached, airbrushed, waxy, or detached from the lighting;
- signs contain prominent nonsense text or accidental brand marks;
- the emotional beat is unreadable without a long explanation;
- trim, gutter, caption space, or resolution is unsafe for the selected edition;
- the caption claims more than the image or sources can support.

Review the sequence as a book, not only as isolated attractive images. The completed edition should feel like a quiet day opening into many lives: varied, contemporary, respectful, and unmistakably human.

