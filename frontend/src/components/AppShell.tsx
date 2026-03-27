import {
  CalendarOutlined,
  CommentOutlined,
  CompassOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  PictureOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Space } from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { api } from "../api/services";
import { useAuth } from "../store/auth";

const navList = [
  { key: "/", label: "首页", icon: <CompassOutlined /> },
  { key: "/exhibits", label: "展品", icon: <PictureOutlined /> },
  { key: "/exhibitions", label: "展览", icon: <CalendarOutlined /> },
  { key: "/guide", label: "参观指南", icon: <CompassOutlined /> },
  { key: "/visits", label: "预约参观", icon: <CommentOutlined /> },
];

export function AppShell() {
  const { Header, Content, Footer } = Layout;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey =
    location.pathname === "/"
      ? "/"
      : navList.find((item) => item.key !== "/" && location.pathname.startsWith(item.key))?.key;
  const selectedKeys = location.pathname.startsWith("/admin") ? ["/admin"] : selectedKey ? [selectedKey] : [];

  async function doLogout() {
    try {
      await api.logout();
    } catch {
      // 这里忽略退出失败，仍清理本地态
    } finally {
      setUser(null);
      navigate("/");
    }
  }

  const accountMenu = {
    items: [
      { key: "visits", label: "我的预约", icon: <CalendarOutlined /> },
      ...(user?.role === "admin"
        ? [{ key: "admin", label: "管理后台", icon: <DashboardOutlined /> }]
        : []),
      { key: "logout", label: "退出登录", icon: <LogoutOutlined /> },
    ],
    onClick: async ({ key }: { key: string }) => {
      if (key === "visits") {
        navigate("/visits");
      }
      if (key === "admin") {
        navigate("/admin");
      }
      if (key === "logout") {
        await doLogout();
      }
    },
  };

  return (
    <Layout className="site-shell">
      <Header className="site-header">
        <div className="brand-box">
          <Link to="/" className="brand-link">
            <span className="brand-dot" />
            <span>博物馆门户类软件</span>
          </Link>
        </div>
        <div className="nav-desktop">
          <Menu
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={navList.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={item.key}>{item.label}</Link>,
            }))}
          />
        </div>
        <Space className="header-actions" size={12}>
          {user ? (
            <Dropdown menu={accountMenu} placement="bottomRight">
              <Button type="text" className="user-trigger">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user.display_name}</span>
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate("/auth")}>
              登录 / 注册
            </Button>
          )}
          <Button className="nav-mobile-btn" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
        </Space>
      </Header>

      <Drawer placement="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} title="站点导航">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={[
            ...navList.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => {
                navigate(item.key);
                setDrawerOpen(false);
              },
            })),
            ...(user?.role === "admin"
              ? [
                  {
                    key: "/admin",
                    icon: <DashboardOutlined />,
                    label: "管理后台",
                    onClick: () => {
                      navigate("/admin");
                      setDrawerOpen(false);
                    },
                  },
                ]
              : []),
          ]}
        />
      </Drawer>

      <Content className="site-content">
        <Outlet />
      </Content>

      <Footer className="site-footer">博物馆门户类软件</Footer>
    </Layout>
  );
}
