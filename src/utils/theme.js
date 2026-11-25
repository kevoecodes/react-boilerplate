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
  /** Light sidebar (FMS-style); accents use colorPrimary */
  siderBg: '#ffffff',
  borderRadius: 8,
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

/** Ant Design theme config built from the shared tokens. */
export const antdTheme = {
  token: {
    colorPrimary: tokens.colorPrimary,
    colorPrimaryHover: '#7a2328',
    colorPrimaryActive: '#5c1a1d',
    colorLink: tokens.colorPrimary,
    colorLinkHover: '#7a2328',
    colorLinkActive: '#5c1a1d',
    colorInfo: tokens.colorInfo,
    colorSuccess: tokens.colorSuccess,
    colorWarning: tokens.colorWarning,
    colorError: tokens.colorError,
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
      triggerBg: tokens.colorPrimary,
      triggerColor: '#ffffff',
      headerBg: tokens.colorBgContainer,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: tokens.siderBg,
      subMenuItemBg: tokens.siderBg,
      itemColor: tokens.colorTextSecondary,
      itemHoverColor: '#ffffff',
      itemHoverBg: tokens.colorPrimary,
      itemSelectedColor: '#ffffff',
      itemSelectedBg: tokens.colorPrimary,
      itemActiveBg: tokens.colorPrimary,
      iconSize: 16,
    },
    Button: {
      primaryColor: '#ffffff',
      defaultHoverBorderColor: tokens.colorPrimary,
      defaultHoverColor: tokens.colorPrimary,
      textHoverBg: 'rgba(150, 44, 48, 0.06)',
    },
    Avatar: {
      containerSizeSM: 24,
    },
  },
};
