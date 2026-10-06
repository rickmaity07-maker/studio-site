/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a production build run beside `next dev` without sharing .next
  // (e.g. NEXT_DIST_DIR=.next-prod next build && next start).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        // The Android app: the right type for package installers, always a download.
        source: "/downloads/:file*.apk",
        headers: [
          { key: "Content-Type", value: "application/vnd.android.package-archive" },
          { key: "Content-Disposition", value: "attachment" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  }
};

export default nextConfig;
