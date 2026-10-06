/**
 * The Android app as offered on /app. Bump `version` together with the
 * APK in public/downloads (build it with `cd android && ./gradlew assembleRelease
 * -PversionCode=N -PversionName=X.Y.Z`, then copy app-release.apk over).
 */
export const androidApp = {
  name: "Rick.build for Android",
  version: "1.0.0",
  /** Served from /public; size and checksum are read from the file at build time. */
  path: "/downloads/rick-build.apk",
  /** minSdk 26 in android/app/build.gradle.kts */
  minAndroid: "8.0"
};
