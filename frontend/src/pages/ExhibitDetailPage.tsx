import { DeleteOutlined, EnvironmentOutlined, MessageOutlined, RollbackOutlined } from "@ant-design/icons";
import { App, Button, Card, Empty, Form, Input, List, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { pickErrorMsg } from "../api/client";
import { api } from "../api/services";
import type { ExhibitDetail } from "../api/types";
import { useAuth } from "../store/auth";
import { excerpt, statusColor } from "../utils/museum";

const commentSchema = z.object({
  content: z.string().min(4, "评论至少 4 个字").max(280, "评论最多 280 个字"),
});

export function ExhibitDetailPage() {
  const { message, modal } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ExhibitDetail | null>(null);

  async function loadDetail() {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      setData(await api.exhibitDetail(Number(id)));
    } catch (error) {
      message.error(pickErrorMsg(error));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function submitComment() {
    try {
      const values = commentSchema.parse(form.getFieldsValue());
      setSubmitting(true);
      await api.createComment({
        exhibit_id: Number(id),
        content: values.content,
      });
      message.success("评论已发布");
      form.resetFields();
      await loadDetail();
    } catch (error) {
      message.error(pickErrorMsg(error));
    } finally {
      setSubmitting(false);
    }
  }

  function removeComment(commentId: number) {
    modal.confirm({
      title: "确认删除这条评论吗？",
      content: "删除后无法恢复，请再次确认。",
      okText: "确认删除",
      cancelText: "先保留",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.removeComment(commentId);
          message.success("评论已删除");
          await loadDetail();
        } catch (error) {
          message.error(pickErrorMsg(error));
        }
      },
    });
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-wrap">
        <Card className="soft-card">
          <Empty description="展品信息不存在或已下线">
            <Button type="primary" onClick={() => navigate("/exhibits")}>
              返回展品列表
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <Card className="soft-card detail-card">
        <div className="detail-grid">
          <img alt={data.name} src={data.image_url} className="detail-cover" />
          <div className="detail-copy">
            <Space wrap className="card-tags">
              <Tag color="gold">{data.category}</Tag>
              <Tag>{data.era}</Tag>
              <Tag color="cyan">{data.comments_count} 条评论</Tag>
            </Space>
            <Typography.Title level={2}>{data.name}</Typography.Title>
            <Typography.Paragraph>{data.summary}</Typography.Paragraph>
            <Typography.Paragraph>{data.detail}</Typography.Paragraph>
            <Space className="meta-line">
              <EnvironmentOutlined />
              <span>{data.hall_name}</span>
            </Space>
            <div className="detail-actions">
              <Button type="primary" onClick={() => navigate("/visits")}>
                预约参观
              </Button>
              <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
                返回
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="soft-card section-card">
        <div className="section-head">
          <div>
            <Typography.Title level={3}>观众评论</Typography.Title>
            <Typography.Text type="secondary">登录后可以发布或删除自己的评论，管理员也可以直接管理。</Typography.Text>
          </div>
        </div>
        {user ? (
          <Form form={form} layout="vertical" className="comment-form">
            <Form.Item label="评论内容" name="content">
              <Input.TextArea rows={4} maxLength={280} placeholder={`围绕 ${excerpt(data.name, 16)} 说说你的感受`} />
            </Form.Item>
            <Button type="primary" icon={<MessageOutlined />} loading={submitting} onClick={submitComment}>
              发布评论
            </Button>
          </Form>
        ) : (
          <Card className="muted-box">
            登录后可发布评论。
            <Button type="link" onClick={() => navigate("/auth")}>
              去登录
            </Button>
          </Card>
        )}

        <List
          locale={{ emptyText: "还没有评论，欢迎写下你的第一条观展感受。" }}
          dataSource={data.comments}
          renderItem={(item) => (
            <List.Item
              actions={
                user && (user.id === item.user.id || user.role === "admin")
                  ? [
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeComment(item.id)}>
                        删除
                      </Button>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                title={
                  <Space wrap>
                    <Typography.Text strong>{item.user.display_name}</Typography.Text>
                    <Tag color={statusColor(item.status)}>{item.status}</Tag>
                    <Typography.Text type="secondary">{dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}</Typography.Text>
                  </Space>
                }
                description={item.content}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
