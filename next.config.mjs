/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a production build run beside `next dev` without sharing .next
  // (e.g. NEXT_DIST_DIR=.next-prod next build && next start).
  distDir: process.env.NEXT_DIST_DIR || ".next"
};

export default nextConfig;
