import { Result, Spin } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../store/auth";

function GuardLoading() {
  return (
    <div className="app-loading">
      <Spin size="large" tip="正在校验权限" />
    </div>
  );
}

export function LoginGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GuardLoading />;
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function AdminGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <GuardLoading />;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (user.role !== "admin") {
    return (
      <Result
        className="page-wrap"
        status="403"
        title="没有权限访问"
        subTitle="当前账号不是管理员，无法进入后台。"
      />
    );
  }
  return <Outlet />;
}
