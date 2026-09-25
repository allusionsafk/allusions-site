# Capture provenance: ValClips

Every image in this folder is a screenshot of the real ValClips Session Director, not a mock-up. They were captured on 24 September 2026 from build `83568e4` (branch `claude/valclips-ui-convergence-v1`, private; "rebuild the Session Director on the approved ValClips product language"). The Director ran on the maker's own PC against their real recordings and was driven by URL in a headless browser: nothing was rendered, reviewed or published to make these images. Desktop captures are 1536×864 at 1.5× scale and are served as WebP at up to 1600 px wide. The `*-phone.webp` images are the Director's own phone layout at 430 px wide, except for Treatment, whose phone image is a crop of the desktop inspector.

The session is a real 57-minute sitting from 12 September 2026. The footage is the maker's own gameplay. VALORANT is a trademark of Riot Games; ValClips is not affiliated with or endorsed by Riot Games.

| File | State shown | Edits |
| --- | --- | --- |
| `vc-session-*.webp` | Session: three ranked stories worth making, with the sitting's counts | Account and player names blurred in place in the page (visible blur) |
| `vc-preview-*.webp` | Preview: the rendered 20 s edit of the first story, paused at 6 s, with its five beats in time | None |
| `vc-treatment-*.webp` | Treatment: As planned selected, the other treatments, pacing settings, and a source frame of the story | Player names in the in-game kill feed covered by a visible blur box; the phone image is the inspector column |
| `vc-ready-*.webp` | Ready: rendered and verified, not yet reviewed, so not publishable; the destination's sign-in needs renewing | The channel name and the output file path blurred in place in the page; cropped below the content |
| `vc-edit-beat2-*.webp` | The finished edit itself: a frame at 00:06 (beat 2) of the rendered 20 s, 1080×1920 file for "Same opponent, 5 times" | Extracted read-only from the rendered MP4 with FFmpeg; scaled to 810 and 540 px wide |
| `vc-edit-beat3-*.webp` | The finished edit at 00:10 (beat 3) | Same as above |
| `vc-edit-payoff-*.webp` | The finished edit at 00:18 (the payoff beat) | Same as above; one player name tag above a character covered by a visible blur box |

The three edit frames are real output: they come from the render ValClips produced for this story before these captures were taken, not from a new render.
