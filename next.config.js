/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
            "source": "/index.html",
            "destination": "/",
            "permanent": true
      },
      {
            "source": "/blog.html",
            "destination": "/blog",
            "permanent": true
      },
      {
            "source": "/choosing-the-right-diving-program.html",
            "destination": "/choosing-the-right-diving-program",
            "permanent": true
      },
      {
            "source": "/coaches.html",
            "destination": "/coaches",
            "permanent": true
      },
      {
            "source": "/contact.html",
            "destination": "/contact",
            "permanent": true
      },
      {
            "source": "/dryland-training-for-divers.html",
            "destination": "/dryland-training-for-divers",
            "permanent": true
      },
      {
            "source": "/first-diving-practice-what-to-expect.html",
            "destination": "/first-diving-practice-what-to-expect",
            "permanent": true
      },
      {
            "source": "/how-club-diving-helps-high-school-divers.html",
            "destination": "/how-club-diving-helps-high-school-divers",
            "permanent": true
      },
      {
            "source": "/missouri-high-school-diving-1-meter.html",
            "destination": "/missouri-high-school-diving-1-meter",
            "permanent": true
      },
      {
            "source": "/olympic-diving-events-explained.html",
            "destination": "/olympic-diving-events-explained",
            "permanent": true
      },
      {
            "source": "/one-meter-vs-three-meter-diving.html",
            "destination": "/one-meter-vs-three-meter-diving",
            "permanent": true
      },
      {
            "source": "/one-meter.html",
            "destination": "/one-meter",
            "permanent": true
      },
      {
            "source": "/photo-credits.html",
            "destination": "/photo-credits",
            "permanent": true
      },
      {
            "source": "/platform-diving-safety-and-readiness.html",
            "destination": "/platform-diving-safety-and-readiness",
            "permanent": true
      },
      {
            "source": "/programs.html",
            "destination": "/programs",
            "permanent": true
      },
      {
            "source": "/signup.html",
            "destination": "/signup",
            "permanent": true
      },
      {
            "source": "/three-meter.html",
            "destination": "/three-meter",
            "permanent": true
      },
      {
            "source": "/tower.html",
            "destination": "/tower",
            "permanent": true
      },
      {
            "source": "/usa-diving-pathway-for-families.html",
            "destination": "/usa-diving-pathway-for-families",
            "permanent": true
      },
      {
            "source": "/what-diving-judges-look-for.html",
            "destination": "/what-diving-judges-look-for",
            "permanent": true
      }
];
  },
};

module.exports = nextConfig;
