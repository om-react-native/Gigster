# Building the AAB for Google Play Store

## Option 1: Local build (recommended for quick iteration)

From the project root, run:

```bash
npm run build:android:aab
```

- **First run:** Can take 10–15 minutes. Later runs are faster (cached).
- **Output:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Signing:** The AAB is signed with the **debug keystore**. You can use it for **internal testing** in Play Console. For **production**, use Option 2 or configure a release keystore in `android/app/build.gradle`.

## Option 2: EAS Build (recommended for production)

EAS Build produces an AAB signed with a proper key and is suitable for production.

1. Install EAS CLI (if needed): `npm install -g eas-cli`
2. Log in: `eas login`
3. Run the build **in your terminal** (interactive so you can create the keystore on first run):

   ```bash
   eas build --platform android --profile production
   ```

4. When prompted **“Generate a new Android Keystore?”** choose **Yes** so EAS can create and store the key.
5. When the build finishes, download the AAB from the link in the terminal or from [expo.dev](https://expo.dev).

Then upload the downloaded `.aab` in [Google Play Console](https://play.google.com/console) → your app → **Production** (or **Testing**) → **Create new release** → upload the AAB.

## Summary

| Method              | Command                                      | Output / Use case                    |
|---------------------|----------------------------------------------|--------------------------------------|
| Local AAB           | `npm run build:android:aab`                  | `android/.../release/app-release.aab` (debug-signed, internal testing) |
| EAS Build (cloud)   | `eas build --platform android --profile production` | Download link (production-ready AAB) |
