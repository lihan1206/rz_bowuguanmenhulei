import { App as AntApp, ConfigProvider, Spin, theme } from "antd";
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

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#0e7490",
          colorInfo: "#0e7490",
          colorSuccess: "#15803d",
          colorWarning: "#d97706",
          colorError: "#dc2626",
          borderRadius: 18,
          fontFamily: '"HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<div className="app-loading"><Spin size="large" tip="页面加载中" /></div>}>
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
