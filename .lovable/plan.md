

## Turn Orion Labs into a Native Android App with Capacitor

### What This Does
Wraps your existing Orion Labs web app inside a native Android shell so it can be installed from the Google Play Store -- just like any other app. All your current features (invoices, CRM, fleet, gym, school, etc.) will work exactly as they do now.

### What Changes in the Code

**1. Install Capacitor packages**
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`

**2. Create `capacitor.config.ts`**
- App ID: `app.lovable.67587da810ad4273a0f2b7869f6664a3`
- App Name: `Orion Labs`
- Points to your live preview URL for hot-reload during development
- Web directory set to `dist` (your build output)

**3. Update `vite.config.ts`**
- Add `/~oauth` to the PWA service worker's `navigateFallbackDenylist` to prevent caching issues with authentication redirects

### What You Do on Your Computer

After I make the code changes, you will need to:

1. **Export to GitHub** -- Go to Settings and click "Export to GitHub"
2. **Clone the repo** locally and run `npm install`
3. **Add Android platform** -- Run `npx cap add android`
4. **Build and sync** -- Run `npm run build && npx cap sync`
5. **Open in Android Studio** -- Run `npx cap run android`
   - Android Studio is free and includes a phone emulator, so no physical device needed
6. **Test in the emulator** -- Your full Orion Labs app will launch just like on a real phone

### Publishing to Google Play Store

Once you are happy with testing:

1. Create a Google Play Developer account ($25 USD one-time fee)
2. In Android Studio: Build > Generate Signed Bundle (AAB)
3. Upload the AAB to the Google Play Console
4. Fill in your store listing (app description, screenshots, icon)
5. Submit for review (typically approved within hours to a few days)

### Ongoing Workflow

Whenever you make changes in Lovable:
1. Pull the latest code from GitHub
2. Run `npm run build && npx cap sync`
3. Rebuild in Android Studio and upload a new version to the Play Store

### Technical Notes

- The existing PWA configuration, offline support, and push notifications all carry over
- No existing features are modified -- Capacitor is purely additive
- Adding iOS later is straightforward: just run `npx cap add ios` and open in Xcode (requires a Mac and a $99/year Apple Developer account)

