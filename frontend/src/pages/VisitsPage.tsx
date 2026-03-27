import { CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, DatePicker, Empty, Form, Input, InputNumber, List, Row, Skeleton, Space, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { z } from "zod";

import { pickErrorMsg } from "../api/client";
import { api } from "../api/services";
import type { VisitItem } from "../api/types";
import { useAuth } from "../store/auth";

const visitSchema = z.object({
  visitor_name: z.string().min(2, "姓名至少 2 个字").max(80, "姓名过长"),
  phone: z.string().min(6, "请输入有效手机号").max(20, "手机号过长"),
  visit_date: z.any(),
  party_size: z.number().min(1, "至少 1 人").max(6, "单次最多 6 人"),
  note: z.string().max(240, "备注最多 240 字").optional().or(z.literal("")),
});

export function VisitsPage() {
  const { message, modal } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<VisitItem[]>([]);

  async function loadVisits() {
    setLoading(true);
    try {
      setRows(await api.myVisits());
    } catch (error) {
      message.error(pickErrorMsg(error));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadVisits();
    }
  }, [user]);

  async function submitVisit() {
    try {
      const values = visitSchema.parse(form.getFieldsValue());
      setSaving(true);
      await api.createVisit({
        visitor_name: values.visitor_name,
        phone: values.phone,
        visit_date: dayjs(values.visit_date).format("YYYY-MM-DD"),
        party_size: values.party_size,
        note: values.note || null,
      });
      message.success("预约提交成功");
      form.resetFields();
      await loadVisits();
    } catch (error) {
      message.error(pickErrorMsg(error));
    } finally {
      setSaving(false);
    }
  }

  function removeVisit(id: number) {
    modal.confirm({
      title: "确认取消本次预约吗？",
      content: "取消后名额将立即释放，如需参观可重新提交新预约。",
      okText: "确认取消",
      cancelText: "继续保留",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.cancelVisit(id);
          message.success("预约已取消");
          await loadVisits();
        } catch (error) {
          message.error(pickErrorMsg(error));
        }
      },
    });
  }

  if (!user) {
    return (
      <div className="page-wrap">
        <Card className="soft-card">
          <Typography.Title level={3}>预约参观</Typography.Title>
          <Typography.Paragraph>请先登录，再填写预约信息与到馆日期。</Typography.Paragraph>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <Card className="soft-card" title="在线预约">
            <Form form={form} layout="vertical" initialValues={{ party_size: 1 }}>
              <Form.Item name="visitor_name" label="参观人姓名">
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
              <Form.Item name="phone" label="联系电话">
                <Input placeholder="请输入手机号码" />
              </Form.Item>
              <Form.Item name="visit_date" label="预约日期">
                <DatePicker className="full-width" disabledDate={(current) => current.isBefore(dayjs().startOf("day"))} />
              </Form.Item>
              <Form.Item name="party_size" label="同行人数">
                <InputNumber className="full-width" min={1} max={6} />
              </Form.Item>
              <Form.Item name="note" label="补充说明">
                <Input.TextArea rows={4} placeholder="如有老人、儿童同行或无障碍需求，可在此说明" />
              </Form.Item>
              <Button type="primary" icon={<CalendarOutlined />} block loading={saving} onClick={submitVisit}>
                提交预约
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card className="soft-card" title="我的预约记录">
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : rows.length === 0 ? (
              <Empty description="你还没有预约记录" />
            ) : (
              <List
                dataSource={rows}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeVisit(item.id)}>
                        取消预约
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space wrap>
                          <Typography.Text strong>{item.visitor_name}</Typography.Text>
                          <Typography.Text type="secondary">{item.status}</Typography.Text>
                        </Space>
                      }
                      description={
                        <>
                          <div>到馆日期：{dayjs(item.visit_date).format("YYYY年MM月DD日")}</div>
                          <div>同行人数：{item.party_size} 人</div>
                          <div>联系电话：{item.phone}</div>
                          {item.note ? <div>备注：{item.note}</div> : null}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

