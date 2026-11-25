/**
 * Shared design tokens.
 * Consumed by BOTH Ant Design (ConfigProvider theme) and Tailwind (tailwind.config.js)
 * so utility classes and AntD components always use the same palette and radii.
 */
export const tokens = {
  colorPrimary: '#962c30',
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
  colorError: '#dc2626',
  colorInfo: '#0284c7',
  colorText: '#1f2937',
  colorTextSecondary: '#6b7280',
  colorBorder: '#e5e7eb',
  colorBgLayout: '#f5f6fa',
  colorBgContainer: '#ffffff',
  siderBg: '#111827',
  borderRadius: 8,
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

/** Ant Design theme config built from the shared tokens. */
export const antdTheme = {
  token: {
    colorPrimary: tokens.colorPrimary,
    colorSuccess: tokens.colorSuccess,
    colorWarning: tokens.colorWarning,
    colorError: tokens.colorError,
    colorInfo: tokens.colorInfo,
    colorText: tokens.colorText,
    colorTextSecondary: tokens.colorTextSecondary,
    colorBorder: tokens.colorBorder,
    colorBgLayout: tokens.colorBgLayout,
    colorBgContainer: tokens.colorBgContainer,
    borderRadius: tokens.borderRadius,
    fontFamily: tokens.fontFamily,
  },
  components: {
    Layout: {
      siderBg: tokens.siderBg,
      triggerBg: '#0b1220',
      headerBg: tokens.colorBgContainer,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: tokens.siderBg,
      darkSubMenuItemBg: '#0b1220',
    },
  },
};
