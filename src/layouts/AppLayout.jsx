import { useEffect, useMemo, useState } from 'react';
import { Avatar, Breadcrumb, Button, Dropdown, Grid, Layout, Menu, Typography } from 'antd';
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { findMenuTrail, menuItems } from '@/routes/menu';

const { Header, Sider, Content } = Layout;
const APP_NAME = import.meta.env.VITE_APP_NAME || 'React Boilerplate';
const COLLAPSE_KEY = 'rb.sider-collapsed';

const toAntdItems = (items) =>
  items.map(({ key, label, icon, children }) => ({
    key,
    icon,
    label,
    children: children ? toAntdItems(children) : undefined,
  }));

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const trail = useMemo(() => findMenuTrail(location.pathname), [location.pathname]);
  const selectedKey = trail.at(-1)?.key ?? location.pathname;
  const [openKeys, setOpenKeys] = useState(() => trail.slice(0, -1).map((i) => i.key));

  // Open the parent sub-menu when navigating to a nested page.
  useEffect(() => {
    const parents = trail.slice(0, -1).map((i) => i.key);
    setOpenKeys((prev) => Array.from(new Set([...prev, ...parents])));
  }, [trail]);

  const breadcrumbItems = [
    { title: <Link to="/">Home</Link> },
    ...trail
      .filter((i) => i.path !== '/')
      .map((i) => ({ title: i.path ? <Link to={i.path}>{i.label}</Link> : i.label })),
  ];

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: (
          <div className="py-1">
            <div className="font-medium">{user?.name}</div>
            <div className="text-xs text-muted">{user?.email}</div>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true },
    ],
    onClick: async ({ key }) => {
      if (key === 'logout') {
        await logout();
        navigate('/login', { replace: true });
      }
    },
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={screens.xs ? 0 : 80}
        width={240}
        className="!sticky top-0 h-screen overflow-auto"
      >
        <Link to="/" className="flex h-16 items-center gap-3 px-6 text-white no-underline">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary font-bold">
            R
          </span>
          {!collapsed && <span className="truncate text-base font-semibold">{APP_NAME}</span>}
        </Link>
        <Menu
          theme="dark"
          mode="inline"
          items={toAntdItems(menuItems)}
          selectedKeys={[selectedKey]}
          openKeys={collapsed ? undefined : openKeys}
          onOpenChange={setOpenKeys}
          onClick={({ key }) => key.startsWith('/') && navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="sticky top-0 z-10 flex items-center gap-4 border-0 border-b border-solid border-border shadow-sm">
          <Button
            type="text"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((c) => !c)}
          />
          <Breadcrumb items={breadcrumbItems} className="hidden sm:block" />
          <div className="ml-auto">
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <Button type="text" className="flex h-10 items-center gap-2">
                <Avatar size="small" className="bg-primary" icon={<UserOutlined />} />
                <Typography.Text className="hidden sm:inline">{user?.name}</Typography.Text>
                <DownOutlined className="text-xs text-muted" />
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-4 sm:p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
