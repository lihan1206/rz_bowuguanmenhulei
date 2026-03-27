import { App, Button, Card, Form, Input, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { pickErrorMsg } from "../api/client";
import { api } from "../api/services";
import { useAuth } from "../store/auth";

const loginSchema = z.object({
  email: z.string().email("请输入正确邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

const registerSchema = z.object({
  email: z.string().email("请输入正确邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
  display_name: z.string().min(2, "姓名至少 2 个字").max(20, "姓名过长"),
  phone: z.string().min(6, "请输入有效手机号").max(20, "手机号过长").optional().or(z.literal("")),
});

export function AuthPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  async function loginNow() {
    try {
      const payload = loginSchema.parse(loginForm.getFieldsValue());
      const user = await api.login(payload);
      setUser(user);
      message.success("登录成功");
      navigate("/");
    } catch (error) {
      message.error(pickErrorMsg(error));
    }
  }

  async function registerNow() {
    try {
      const payload = registerSchema.parse(registerForm.getFieldsValue());
      await api.register({
        ...payload,
        phone: payload.phone || null,
      });
      message.success("注册成功，请直接登录");
      registerForm.resetFields();
    } catch (error) {
      message.error(pickErrorMsg(error));
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Typography.Title level={1} className="auth-title">
          博物馆门户
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: "center" }}>
          管理员账号：admin@museumportal.com
        </Typography.Paragraph>
        <Tabs
          items={[
            {
              key: "login",
              label: "登录",
              children: (
                <Form form={loginForm} layout="vertical">
                  <Form.Item name="email" label="邮箱">
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                  <Form.Item name="password" label="密码">
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                  <Button type="primary" block onClick={loginNow}>
                    立即登录
                  </Button>
                </Form>
              ),
            },
            {
              key: "register",
              label: "注册",
              children: (
                <Form form={registerForm} layout="vertical">
                  <Form.Item name="display_name" label="姓名">
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱">
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                  <Form.Item name="phone" label="手机号">
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                  <Form.Item name="password" label="密码">
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                  <Button type="primary" block onClick={registerNow}>
                    创建账号
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
