import {
  AppstoreOutlined,
  DashboardOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons';

/**
 * Sidebar navigation. Items with `children` render as nested sub-menus.
 * `path` is also used to build breadcrumbs, so keep it in sync with routes/index.jsx.
 */
export const menuItems = [
  { key: '/', path: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  {
    key: 'catalog',
    label: 'Catalog',
    icon: <AppstoreOutlined />,
    children: [{ key: '/products', path: '/products', label: 'Products', icon: <ShoppingOutlined /> }],
  },
  {
    key: 'sales',
    label: 'Sales',
    icon: <ShoppingCartOutlined />,
    children: [{ key: '/orders', path: '/orders', label: 'Orders', icon: <ShoppingCartOutlined /> }],
  },
  {
    key: 'admin',
    label: 'Administration',
    icon: <SettingOutlined />,
    children: [{ key: '/users', path: '/users', label: 'Users', icon: <TeamOutlined /> }],
  },
];

/** Find the trail of menu items leading to `pathname` (used for breadcrumbs and open sub-menus). */
export function findMenuTrail(pathname, items = menuItems, trail = []) {
  for (const item of items) {
    const next = [...trail, item];
    if (
      item.path &&
      (item.path === pathname || (item.path !== '/' && pathname.startsWith(`${item.path}/`)))
    ) {
      return next;
    }
    if (item.children) {
      const found = findMenuTrail(pathname, item.children, next);
      if (found.length) return found;
    }
  }
  return [];
}
