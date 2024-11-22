import type { NextConfig } from "next";
module.exports = {
  images: {
    domains: [
      process.env.NEXT_PUBLIC_SUPABASE_URL!, // Your Supabase URL
      "via.placeholder.com",
      "farm2.staticflickr.com",
    ],
  },
};
const nextConfig: NextConfig = {
  /* config options here */
};
export default nextConfig;
