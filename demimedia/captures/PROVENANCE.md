# Capture provenance: DemiMedia

Every image in this folder is a screenshot of the real DemiMedia Windows app, not a mock-up. They were captured on 23 September 2026 on the maker's Windows 11 laptop (RTX 4080, 150% display scaling) from build `90e0a87`, which was merged to `main` as `96da0de` on 24 September 2026. DemiMedia has no release yet. Images are WebP at up to 1600 px wide, plus a portrait or landscape crop (`*-phone.webp`) of the part that carries the evidence, served to phone-width screens. Nothing inside a window was drawn or retouched. The only edits are the crops and the redactions listed below.

The media shown are generated test clips (colour bars and a titled test file). No film or third-party footage appears.

| File | State shown | Edits |
| --- | --- | --- |
| `dm-quiet-*.webp` | Quiet playback: a generated colour-bar test clip playing with an SDH subtitle, controls hidden after inactivity, no panels | None. Captured 23 Sep 2026, 1280×720, from DemiMedia's own mpv player configuration during the interface work that became build `90e0a87` (it predates that commit by a few hours; nothing of the interface is on screen in this state). Served at 1280 and 800 px |
| `dm-idle-*.webp` | The start screen before anything is opened | Cropped to its content band: headline, open actions and drop area |
| `dm-choices-*.webp` | Picture choices: Automatic, the outcome list with Balanced improvement chosen, strength, performance, and the plan explained per decision | None; the phone crop is the outcomes and their settings |
| `dm-plan-*.webp` | A test clip opened and ready to play with Enhanced choices, and Playback details showing source and plan | Local file path covered by a visible bar; cropped above the Observed section, which is empty before playback; the phone crop is the details panel |
| `dm-player-details-*.webp` | A colour-bar test clip playing with Playback details open: Source, Requested, Planned, Observed, Health | None; the phone crop is the details panel |

A harness capture of the details panel after a simulated decoder change was considered and left out: in that frame the alert and the Observed section disagree, so it could not stand as evidence.
