# 2026-05-31 Codex Localization and Kid Modals Live Log

## Summary

Today we continued the Winking Star web localization pass and shipped the latest changes live to Firebase Hosting.

The work focused on making zh-Hant apply across the whole web app, replacing remaining English copy in board/pet/task surfaces, aligning old web artwork with the current iOS doodle style, and updating the add/edit kid dialogs to follow the iOS layout more closely.

## Shipped Changes

1. Localization coverage
   - Added the web localization provider and locale controls:
     - `src/lib/i18n.jsx`
     - `src/components/LocaleSelectorButton.jsx`
     - `src/components/LocaleSettingsModal.jsx`
   - Applied localized copy across landing, auth, legal, board, task, pet, reward, summary, and preview surfaces.
   - Added localized theme names, default kid names, activity labels, popup labels, reward copy, and pet species names.
   - Fixed locale-aware dates and numbers, including the previous English `Preview` and English date formatting issue.
   - Added `zh-Hant` translations for pet species including `scooter` -> `滑板車`.

2. Add/edit kid modal parity with iOS
   - Updated `src/components/NewKidModal.jsx`.
   - Replaced the old rectangular theme grid with an iOS-style horizontal theme carousel.
   - Added theme banner art, side peeks, dot indicators, arrow controls, selected check mark, and localized theme captions.
   - Kept avatar emoji selection compact and circular.
   - Auto-matches theme from selected avatar emoji unless the parent manually chooses a theme.
   - Updated `src/components/KidEditModal.jsx`.
   - Reworked the edit modal around a centered avatar preview, photo/emoji/default avatar controls, localized birthday editing, compact circular theme chips, position controls, and localized delete flow.
   - Localized remaining hardcoded English in the edit modal: `Photo`, `Emoji`, `Default`, `Position`, `Move left`, `Move right`, `Done`, delete confirmation, and save/error toasts.

3. Date picker and modal focus
   - Updated `src/components/EarthyDatePicker.jsx`.
   - Date display now uses the active app locale instead of the browser fallback.
   - `Clear` / `Clear date` are now localized.
   - Updated `src/components/Modal.jsx` so dialogs can prefer a specific autofocus target with `data-autofocus="true"`.
   - The edit kid dialog now opens focused on the name input instead of the corner trash/avatar control.

4. iOS-style artwork cleanup
   - Replaced the old empty-state/pet collection artwork with the real iOS splash-style graphic:
     - `public/onboarding-art/winkingstar-splash.png`
   - Updated empty-state/pet gallery art treatment so it matches the current doodle style more closely.
   - Reviewed old web artwork surfaces and removed/replaced the stale collection empty art called out during QA.

5. Board behavior and live cache
   - Removed the auto-scroll jump when tapping an activity sticker.
   - Moved/merged board progress surfaces so the top status area matches the requested layout direction.
   - Added no-cache app-shell headers in `firebase.json` so the public link picks up new SPA builds faster.

## Validation

- `npm run build` passed after the final modal/focus changes.
- `git diff --check` passed.
- Browser harness screenshots were captured for the zh-Hant add/edit kid dialogs:
  - `output/playwright/new-kid-modal-zh.png`
  - `output/playwright/edit-kid-modal-zh.png`
- The checked zh-Hant modal text included:
  - `新增小明星`
  - `橫幅主題`
  - `小明星的世界`
  - `編輯 aa`
  - `2018年5月12日週六`
  - `清除`
  - `完成`

## Deployment

Manual Firebase Hosting deploy completed successfully:

- Firebase project: `weekly-superstar-tracker`
- Hosting URL: `https://weekly-superstar-tracker.web.app`
- Custom domain: `https://winkingstar.com`
- Live asset hash after deploy:
  - `/assets/index-DDeHMeTU.js`
- HTML cache header verified on `https://winkingstar.com/`:
  - `cache-control: public, max-age=0, must-revalidate`
- Live JS bundle verification confirmed the new localization/modal strings are present.

Deploy completed at approximately `2026-05-31 17:16 BST`.

## Current Local State

This work was deployed from the current local working tree, which is still dirty and includes broader localization/art changes from the session.

Relevant changed files from the final modal pass:

- `src/components/NewKidModal.jsx`
- `src/components/KidEditModal.jsx`
- `src/components/EarthyDatePicker.jsx`
- `src/components/Modal.jsx`
- `src/lib/i18n.jsx`
- `firebase.json`

Other session changes remain in the worktree, including localized board/pet/task surfaces, updated artwork, and untracked output screenshots.

## Notes

- The latest public site should serve `/assets/index-DDeHMeTU.js`.
- If a browser still shows an older build, hard refresh or open a fresh private window; the app shell now has no-cache headers, but already-open SPA sessions can still keep old JS until reload.

## Follow-up: Edit Kid Web Layout

After the user asked whether the edit-kid flow could be more web-page friendly, the edit modal was adjusted while keeping the same flow.

- Researched modal/form guidance from WAI-ARIA APG, GOV.UK Design System, and NN/g form usability recommendations.
- Updated `src/components/KidEditModal.jsx`:
  - Wider desktop dialog with two-column layout.
  - Left profile/avatar panel.
  - Right grouped details, theme, and position sections.
  - Mobile keeps a one-column layout with the Done action visible while content scrolls.
  - Name input now has a programmatic `label`/`id` association.
- Updated `src/components/Modal.jsx`:
  - Added `panelClassName` so individual dialogs can choose a wider web layout without changing every modal.

Validation:

- `npm run build` passed.
- `git diff --check` passed.
- Browser screenshots captured:
  - `output/playwright/edit-kid-modal-web-desktop-zh.png`
  - `output/playwright/edit-kid-modal-web-mobile-zh.png`

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this deploy:
  - `/assets/index-DHuT7W0r.js`
  - `/assets/Board-CHHfiZmW.js`
- Live `index.html` and board bundle match local `dist` checksums.

## Follow-up: Edit Kid Cleanup

- Simplified edit-kid theme chips so each avatar/theme icon uses a single circular background color.
- Moved the delete-superstar action out of the top-right corner and into the modal footer on the left, with Done remaining on the right.

Validation:

- `npm run build` passed.
- `git diff --check` passed.
- Verified the old top-right delete class and the old inner chip circle class are absent from source and the live board bundle.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live asset hash after this cleanup:
  - `/assets/index-CRndqb83.js`
  - `/assets/Board-VSVyqnEH.js`
- Live `index.html` and board bundle match local `dist` checksums.

## Follow-up: Task Editor Web Layout

- Updated `src/components/ActivitiesModal.jsx` to use a wider web dialog instead of the old narrow mobile-style layout.
- Updated `src/components/ActivityRow.jsx` so task rows scan like a web table on desktop:
  - Desktop column labels for emoji, task name, color, position, and delete.
  - Wider task-name field.
  - Footer action area with add/preset controls on the left and Done on the right.
  - Mobile keeps the compact single-column behavior.

Validation:

- `npm run build` passed.
- `git diff --check` passed.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live asset hash after this task-editor update:
  - `/assets/index-i1Cxnu57.js`
  - `/assets/Board-BLYiN2F5.js`
- Live `index.html` and board bundle match local `dist` checksums.

## Follow-up: Overlay Web Layout Pass

- Reviewed every shared overlay/modal usage on the board and account flows.
- Updated the remaining mobile-style dialogs to use web-width panels with scrollable content regions and footer actions:
  - `src/components/LocaleSettingsModal.jsx`
  - `src/components/NewKidModal.jsx`
  - `src/components/ActivitiesModal.jsx` delete confirmation
  - `src/components/BadgeShelf.jsx`
  - `src/components/PetGallery.jsx`
  - `src/components/WeeklySummary.jsx`
  - `src/components/MysteryBox.jsx`
  - `src/components/MysteryPet.jsx`
  - `src/components/PromptModal.jsx`
  - `src/components/ShareModal.jsx`
  - `src/components/LinkAccountModal.jsx`
  - `src/pages/Board.jsx` sign-out, delete-account, and share-gate dialogs
- Converted the custom share overlay to the shared `Modal` shell so it matches the rest of the site.
- Added localized copy for remaining overlay strings in share, link-account, sign-out/delete-account, share-gate, and weekly recap flows.

Validation:

- `npm run build` passed.
- `git diff --check` passed.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this overlay update:
  - `/assets/index-DM89mG1u.js`
  - `/assets/Board-BPgng7Na.js`
  - `/assets/LocaleSettingsModal-XSO7j0aS.js`
  - `/assets/LinkAccountModal-Dz1yUMU5.js`
- Live `index.html`, index bundle, board bundle, locale modal bundle, and link-account modal bundle match local `dist` checksums.
- HTML last-modified after deploy:
  - `Sun, 31 May 2026 19:38:01 GMT`

## Follow-up: Board Banner Auto Height

- Updated `src/components/ThemeBannerArt.jsx` to support intrinsic aspect-ratio rendering from the real banner asset dimensions.
- Updated `src/pages/Board.jsx` so the active board banner uses `autoHeight` instead of the previous fixed `clamp(156px, 24vw, 220px)` height.
- Kept fixed-height banner behavior available for print sheets and theme picker cards.
- Updated the active board banner `sizes` hint so the browser can select the full-width WebP variant for the wider board surface.

Validation:

- `npm run build` passed.
- `git diff --check` passed.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this banner update:
  - `/assets/index-BIsJOZid.js`
  - `/assets/Board-DrP8KBsy.js`
  - `/assets/ThemeBannerArt-Ca-_RVKO.js`
- Live `index.html`, index bundle, board bundle, and theme banner bundle match local `dist` checksums.
- HTML last-modified after deploy:
  - `Sun, 31 May 2026 19:54:27 GMT`

## Follow-up: Fluent Avatar Consistency

- Added a shared Fluent emoji renderer:
  - `src/lib/emojiAssets.js`
  - `src/components/FluentEmoji.jsx`
- Updated default/theme kid avatars so they render with Fluent emoji PNGs instead of native system emoji glyphs.
- Updated avatar picker and theme picker controls to use the same Fluent renderer.
- Updated product preview kid avatars and buddy icons to use the same Fluent renderer.
- Added static Fluent fallback URLs for emoji that are not covered by the animated Fluent asset map, including elephant and deer.

Validation:

- `npm run build` passed.
- `git diff --check` passed.
- Verified static Fluent CDN URLs for elephant and deer return `HTTP/2 200`.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this avatar update:
  - `/assets/index-5CAnAO4c.js`
  - `/assets/Board-4KQcklEF.js`
  - `/assets/FluentEmoji-C3yle0jY.js`
  - `/assets/ProductPreview-C3VraGHD.js`
- Live `index.html`, index bundle, board bundle, Fluent emoji bundle, and product preview bundle match local `dist` checksums.
- HTML last-modified after deploy:
  - `Sun, 31 May 2026 20:16:39 GMT`

## Follow-up: Edit Kid Avatar and Banner Pickers

- Removed the separate `Emoji` and `Default` avatar mode buttons from `src/components/KidEditModal.jsx`.
- Made the preset avatar list visible by default below the photo control.
- Kept theme-default reset available by clicking the currently selected preset avatar.
- Changed the banner theme picker from circular avatar-style emoji chips to real banner image previews using `ThemeBannerArt`.
- Switched banner picker layout to wider thumbnail cards so banner options read as banners rather than avatars.

Validation:

- `npm run build` passed.
- `git diff --check` passed.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this picker update:
  - `/assets/index-CgAtdak-.js`
  - `/assets/Board-lo8k9aqZ.js`
  - `/assets/ThemeBannerArt-CcE98iX6.js`
  - `/assets/FluentEmoji-C3yle0jY.js`
- Live `index.html`, index bundle, board bundle, banner art bundle, and Fluent emoji bundle match local `dist` checksums.
- HTML last-modified after deploy:
  - `Sun, 31 May 2026 21:05:03 GMT`

## Follow-up: Banner Height and Picker Corners

- Added `autoHeightScale` to `src/components/ThemeBannerArt.jsx` so the board can keep the real banner aspect but render at a reduced height.
- Set the active board top banner to `autoHeightScale={0.5}` in `src/pages/Board.jsx`.
- Added a `borderRadius` override to `ThemeBannerArt`.
- Set edit-kid banner picker thumbnails to `borderRadius={0}` so the real image fills the card edge without the inner rounded-corner gap.

Validation:

- `npm run build` passed.
- `git diff --check` passed.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this banner adjustment:
  - `/assets/index-BcNSyRHy.js`
  - `/assets/Board-CenXhzb-.js`
  - `/assets/ThemeBannerArt-BOJSl2eN.js`
- Live `index.html`, index bundle, board bundle, and banner art bundle match local `dist` checksums.
- HTML last-modified after deploy:
  - `Sun, 31 May 2026 21:31:32 GMT`

## Follow-up: Banner Edge Fill Review

- Audited all theme banner placements:
  - Active board header banner
  - Edit-kid banner picker
  - Add-kid banner picker
  - Signup theme picker
  - Print sheet banner strip
  - Product preview banner/tile usage
- Verified source theme banner PNGs have no transparent edge padding and the stored dimensions match `BANNER_DIMENSIONS`.
- Added a conservative default image overfill in `ThemeBannerArt`:
  - `1.06` for reduced-height auto banners
  - `1.03` for standard theme banner placements
  - Existing explicit scales, such as signup and print sheet, still win.
- Let parent-clipped banner containers own the rounded corners by passing `borderRadius={0}` in board, signup, add-kid, edit-kid, and print-sheet banner placements.
- Confirmed in local browser screenshots that:
  - Signup theme banners fill the selected card edge-to-edge.
  - Board top banner fills its frame edge-to-edge.
  - Edit-kid banner picker thumbnails fill their cards without inner rounded-corner gaps.

Validation:

- `npm run build` passed.
- `git diff --check` passed.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this banner edge-fill review:
  - `/assets/index-DDi3xWTk.js`
  - `/assets/Board-caAInK8n.js`
  - `/assets/ThemeBannerArt-CnAW7GSH.js`
  - `/assets/SignUp-BZCi-0vs.js`
  - `/assets/PrintSheet-CgBhdJAR.js`
- Live `index.html`, index bundle, board bundle, banner art bundle, signup bundle, and print-sheet bundle match local `dist` checksums.
- HTML last-modified after deploy:
  - `Sun, 31 May 2026 21:56:33 GMT`

## Follow-up: Fixed Board Header Banner Frame

- Updated the active board header banner in `src/pages/Board.jsx` to use a fixed responsive frame:
  - `height="clamp(128px, 15vw, 168px)"`
- Removed artwork-driven `autoHeight` sizing from the board header so every selected theme uses the same header frame height.
- Kept the existing image overfill and parent clipping behavior so artwork still fills the frame edge-to-edge.

Validation:

- `npm run build` passed.
- `git diff --check` passed.
- Local browser check measured the board header banner at `966 x 168` on desktop preview.

Deployment:

- Firebase Hosting deploy completed successfully.
- Live app shell verified on `https://winkingstar.com/`.
- Live asset hash after this header-frame fix:
  - `/assets/index-Cao_DnMg.js`
  - `/assets/Board-DD9IRRRC.js`
  - `/assets/ThemeBannerArt-CnAW7GSH.js`
- Live `index.html`, index bundle, and board bundle match local `dist` checksums.
- HTML last-modified after deploy:
  - `Sun, 31 May 2026 22:26:53 GMT`
