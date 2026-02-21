

## Direct App Download (APK Hosting)

### What's Being Built

Since the app isn't on the Play Store or App Store yet, we'll host the Android APK file directly on your platform and let users download and install it from the website. For iOS, since Apple doesn't allow sideloading APKs, we'll show instructions to install the PWA (Add to Home Screen via Safari).

### How It Works

**For Admin (you):**
- A new **"App Distribution"** card in Admin Settings where you upload the latest APK file
- The APK gets stored in your backend file storage
- You can replace it anytime with a newer version and add a version label (e.g. "v1.0.2")

**For Visitors:**
- A **"Download the App"** section on the Landing page (below the hero CTA) and About page
- Android users see a **"Download for Android"** button that downloads the APK directly
- iPhone users see an **"Install on iPhone"** button that opens a popover with step-by-step Safari PWA instructions
- The Footer gets a "Download" column with the same links

### Reusable Component

**`src/components/shared/AppDownloadButtons.tsx`** -- renders both buttons with two variants:
- `variant="hero"` -- white/light buttons for dark gradient backgrounds
- `variant="default"` -- standard themed buttons for light backgrounds

The component fetches the APK URL from a `platform_settings` row (`android_apk_url`) and shows/hides the Android button based on whether an APK has been uploaded.

### File Changes

**New files:**
- `src/components/shared/AppDownloadButtons.tsx` -- reusable download buttons
- `src/components/admin/AppDistributionSettings.tsx` -- admin APK upload card

**Modified files:**
- `src/components/landing/Hero.tsx` -- add download buttons below CTA row
- `src/pages/About.tsx` -- add "Get the App" section before Footer
- `src/components/landing/Footer.tsx` -- add "Download" column
- `src/components/admin/AdminSettingsTab.tsx` -- include the AppDistributionSettings card

### Technical Details

**Storage:** The APK file will be uploaded to a `app-releases` storage bucket (public, max 100MB). The admin uploads the file, and the public URL is saved to `platform_settings` with key `android_apk_url`. A second key `android_apk_version` stores the version label.

**Database:** No new tables -- reuses the existing `platform_settings` table (same pattern as favicon/app icon settings).

**Storage bucket creation:** A migration will create the `app-releases` bucket if it doesn't exist.

**iOS handling:** Since iOS doesn't support APK sideloading, the iPhone button will use a Popover showing: "1. Open this site in Safari  2. Tap the Share icon  3. Tap 'Add to Home Screen'". This installs the PWA which behaves like a native app.

**Admin upload flow:**
1. Admin clicks "Upload APK" in Settings
2. File picker opens (accepts `.apk` files only)
3. File uploads to `app-releases/orion-labs-latest.apk`
4. Public URL saved to `platform_settings`
5. Visitors can now download it

**Android install note:** The download buttons will include a small note: "You may need to enable 'Install from unknown sources' in your phone settings."

