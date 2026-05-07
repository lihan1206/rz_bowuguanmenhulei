import { App as AntApp, ConfigProvider, Result, Spin, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AdminGuard, LoginGuard } from "./components/RouteGuards";
import { AuthProvider } from "./store/auth";

const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const ExhibitsPage = lazy(() => import("./pages/ExhibitsPage").then((module) => ({ default: module.ExhibitsPage })));
const ExhibitDetailPage = lazy(() =>
  import("./pages/ExhibitDetailPage").then((module) => ({ default: module.ExhibitDetailPage })),
);
const ExhibitionsPage = lazy(() =>
  import("./pages/ExhibitionsPage").then((module) => ({ default: module.ExhibitionsPage })),
);
const GuidePage = lazy(() => import("./pages/GuidePage").then((module) => ({ default: module.GuidePage })));
const VisitsPage = lazy(() => import("./pages/VisitsPage").then((module) => ({ default: module.VisitsPage })));
const AuthPage = lazy(() => import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));

function RouteFallback() {
  return (
    <div className="app-loading">
      <Result
        status="info"
        title="页面加载中"
        subTitle="正在准备馆藏数据与页面资源，请稍候。"
        icon={<Spin size="large" />}
      />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#0f766e",
          colorInfo: "#0f766e",
          colorSuccess: "#15803d",
          colorWarning: "#ca8a04",
          colorError: "#b91c1c",
          borderRadius: 18,
          fontFamily: '"PingFang SC", "Microsoft YaHei", "HarmonyOS Sans SC", sans-serif',
        },
        components: {
          Layout: {
            headerBg: "transparent",
            bodyBg: "transparent",
          },
          Card: {
            borderRadiusLG: 24,
          },
          Button: {
            borderRadiusLG: 999,
          },
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/" element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="exhibits" element={<ExhibitsPage />} />
                    <Route path="exhibits/:id" element={<ExhibitDetailPage />} />
                    <Route path="exhibitions" element={<ExhibitionsPage />} />
                    <Route path="guide" element={<GuidePage />} />
                    <Route element={<LoginGuard />}>
                      <Route path="visits" element={<VisitsPage />} />
                    </Route>
                    <Route element={<AdminGuard />}>
                      <Route path="admin" element={<AdminPage />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
