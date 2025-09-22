// postcss.config.mjs

const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // We are not explicitly disabling lightningcss here, as the issue seems to be with
    // Next.js's internal handling of it, not necessarily PostCSS directly.
    // The previous next.config.ts change was meant to address this, but was invalid.
    // This file primarily ensures TailwindCSS and Autoprefixer are correctly configured.
  },
};

export default config;
