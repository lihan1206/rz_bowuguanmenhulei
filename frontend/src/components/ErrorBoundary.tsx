import { Result, Button } from "antd";
import type { ReactNode } from "react";
import { Component } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-wrap">
          <Result
            status="500"
            title="页面出现异常"
            subTitle="请刷新页面后重试，系统已拦截本次异常。"
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                重新加载
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}

