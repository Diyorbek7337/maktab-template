/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking himoyasi
          { key: "X-Frame-Options",        value: "DENY" },
          // MIME sniffing himoyasi
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS himoyasi (eski brauzerlar uchun)
          { key: "X-XSS-Protection",       value: "1; mode=block" },
          // Referrer siyosati
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          // Permissions Policy
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Admin sahifalari — qo'shimcha himoya
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma",        value: "no-cache" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
