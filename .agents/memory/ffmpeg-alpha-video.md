---
name: FFmpeg alpha video conversion
description: Converting solid-background video (e.g. webm mascot/animation clips) to transparent animated WebP for cross-platform RN playback.
---

When a source video has a solid-color (e.g. pure black) background baked in and you need
transparency for overlay use (mascot animations, etc.), use ffmpeg's `colorkey` filter,
not `chromakey`.

**Why:** `chromakey` computes similarity mostly in YUV chroma (UV) space. Desaturated /
near-gray foreground colors (cream, white, tan skin tones, light gray) have chroma close to
black's chroma even though their luma is totally different — so chromakey wrongly marks large
opaque foreground regions (e.g. a character's face) as transparent, silently corrupting the
output. This is easy to miss because a raw RGB preview of the frame still looks fine (RGB
channel data survives) — only the alpha channel is wrong, so you must explicitly inspect the
extracted alpha channel (e.g. `magick foo.png -alpha extract`) to catch it, not just eyeball
the composited image.

**How to apply:** For solid-black (or any solid-color) backgrounds, use
`colorkey=0x000000:similarity:blend` instead of `chromakey=...`. Verify by extracting the
alpha channel of a sample frame and confirming foreground regions are fully opaque (white in
the extracted mask) before batch-converting all clips. Also note: ffmpeg's own animated-webp
*decoder* is unreliable for verification (may fail to read back its own output) — use
ImageMagick (`magick identify` / `magick convert 'file.webp[N]'`) to extract and inspect
individual frames instead.
