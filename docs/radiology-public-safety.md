# RadioDeck public AI boundary

The public build accepts text learning questions only. Image picker, preview,
FileReader and image request construction are removed, with no runtime opt-in.
Drop is rejected; file/image paste is rejected. Either operation revokes consent.
The application does not detect or anonymize patient data.

Text is still sent to Anthropic using the user's own key. The user must confirm
that the current question contains no patient information. Input/paste/drop,
clear, route re-entry and each send revoke confirmation; the send handler also
compares the confirmed text with the current text. This reduces accidental
submission but cannot establish that arbitrary text is free of personal data.

Keys are no longer persisted. Startup removes the legacy radiodeck-apikey from
localStorage and sessionStorage, including when opening non-AI routes. The key
field is blank after navigation and clear. The key remains in the page while
being used and goes to Anthropic for authentication; this is not protection
against browser extensions, compromised same-origin scripts or a modified app.
No automatic migration of old credentials into the input takes place.

## Validation

Use a test-only jsdom installation; no production dependency is added:

```
RADIODECK_JSDOM_MODULE=/path/to/jsdom node --test tests/radiology-image-safety.cjs tests/radiology-medical.test.cjs
RADIODECK_JSDOM_MODULE=/path/to/jsdom node tests/radiology-dom.cjs
```

17 tests pass. DOM smoke checks cover 64 detail views (32 entries, two levels),
two reverse lookups, 30 SVG functions and 29 NurseTube cards, with no JS errors.
Tests use synthetic file contents and fake credentials; fetch is stubbed and
its request body is checked. No patient image or real API key is used. Real
Anthropic requests and actual browser layout are not tested by these checks.

PR #24's earlier description of image upload and optional key persistence is
superseded by this implementation. The PR remains a draft; this is not deployment.
