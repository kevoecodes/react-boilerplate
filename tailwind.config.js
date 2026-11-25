import { tokens } from './src/utils/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Preflight (Tailwind's CSS reset) is disabled so it doesn't fight Ant Design's own base styles.
  corePlugins: {
    preflight: false,
  },
  // No `important` needed: AntD 5 wraps its selectors in :where(), so Tailwind utilities win.
  theme: {
    extend: {
      colors: {
        // Prefer CSS var so HMR picks up brand changes; hex fallback matches tokens.colorPrimary.
        primary: 'var(--color-primary, #962c30)',
        success: tokens.colorSuccess,
        warning: tokens.colorWarning,
        danger: tokens.colorError,
        info: tokens.colorInfo,
        muted: tokens.colorTextSecondary,
        border: tokens.colorBorder,
        layout: tokens.colorBgLayout,
        sider: tokens.siderBg,
      },
      borderRadius: {
        DEFAULT: `${tokens.borderRadius}px`,
      },
      fontFamily: {
        sans: tokens.fontFamily.split(',').map((f) => f.trim()),
      },
    },
  },
  plugins: [],
};
