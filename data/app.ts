/**
 * The Android app as presented on /app. Versions, sizes and checksums come
 * from the published releases in the database (`npm run app:release`).
 */
export const androidApp = {
  name: "Rick.build for Android",
  /** The one link to share; always the newest published version. */
  downloadPath: "/download",
  /** minSdk 26 in android/app/build.gradle.kts */
  minAndroid: "8.0"
};
