import { App, Button, Card, Col, DatePicker, Form, Input, Modal, Row, Select, Space, Statistic, Switch, Table, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { z } from "zod";

import { pickErrorMsg } from "../api/client";
import { api } from "../api/services";
import type {
  AdminCommentItem,
  AdminOverview,
  AnnouncementItem,
  ExhibitItem,
  ExhibitionItem,
  VisitItem,
} from "../api/types";

const exhibitSchema = z.object({
  name: z.string().min(2).max(120),
  era: z.string().min(2).max(60),
  category: z.string().min(2).max(40),
  hall_name: z.string().min(2).max(80),
  summary: z.string().min(8).max(240),
  detail: z.string().min(20).max(4000),
  image_url: z.string().min(5).max(255),
});

const exhibitionSchema = z.object({
  title: z.string().min(2).max(120),
  location: z.string().min(2).max(80),
  start_date: z.any(),
  end_date: z.any(),
  status: z.enum(["展出中", "即将开展", "已结束"]),
  summary: z.string().min(10).max(4000),
  poster_url: z.string().min(5).max(255),
});

const announcementSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().min(6).max(2000),
  pinned: z.boolean(),
});

const guideSchema = z.object({
  open_hours: z.string().min(4).max(120),
  address: z.string().min(4).max(200),
  traffic_guide: z.string().min(10).max(2000),
  ticket_info: z.string().min(4).max(1000),
  map_link: z.string().min(5).max(255),
  visit_tips: z.string().min(10).max(2000),
});

export function AdminPage() {
  const { message, modal } = App.useApp();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [exhibits, setExhibits] = useState<ExhibitItem[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [busy, setBusy] = useState(false);

  const [exhibitForm] = Form.useForm();
  const [exhibitionForm] = Form.useForm();
  const [announcementForm] = Form.useForm();
  const [guideForm] = Form.useForm();

  const [exhibitOpen, setExhibitOpen] = useState(false);
  const [exhibitEditId, setExhibitEditId] = useState<number | null>(null);
  const [exhibitionOpen, setExhibitionOpen] = useState(false);
  const [exhibitionEditId, setExhibitionEditId] = useState<number | null>(null);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementEditId, setAnnouncementEditId] = useState<number | null>(null);

  async function loadAll() {
    setBusy(true);
    try {
      const [ov, exs, expos, notes, g, v, c] = await Promise.all([
        api.adminOverview(),
        api.adminExhibits(),
        api.adminExhibitions(),
        api.adminAnnouncements(),
        api.adminGuide(),
        api.adminVisits(),
        api.adminComments(),
      ]);
      setOverview(ov);
      setExhibits(exs);
      setExhibitions(expos);
      setAnnouncements(notes);
      setVisits(v);
      setComments(c);
      guideForm.setFieldsValue(g);
    } catch (error) {
      message.error(pickErrorMsg(error));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function confirmDelete(title: string, content: string, action: () => Promise<void>) {
    modal.confirm({
      title,
      content,
      okText: "确认删除",
      cancelText: "先保留",
      okButtonProps: { danger: true },
      onOk: action,
    });
  }

  async function saveExhibit() {
    try {
      const values = exhibitSchema.parse(exhibitForm.getFieldsValue());
      if (exhibitEditId) {
        await api.adminUpdateExhibit(exhibitEditId, values);
      } else {
        await api.adminCreateExhibit(values);
      }
      message.success("展品已保存");
      setExhibitOpen(false);
      exhibitForm.resetFields();
      setExhibitEditId(null);
      await loadAll();
    } catch (error) {
      message.error(pickErrorMsg(error));
    }
  }

  async function saveExhibition() {
    try {
      const values = exhibitionSchema.parse(exhibitionForm.getFieldsValue());
      const payload = {
        ...values,
        start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
        end_date: dayjs(values.end_date).format("YYYY-MM-DD"),
      };
      if (exhibitionEditId) {
        await api.adminUpdateExhibition(exhibitionEditId, payload);
      } else {
        await api.adminCreateExhibition(payload);
      }
      message.success("展览已保存");
      setExhibitionOpen(false);
      exhibitionForm.resetFields();
      setExhibitionEditId(null);
      await loadAll();
    } catch (error) {
      message.error(pickErrorMsg(error));
    }
  }

  async function saveAnnouncement() {
    try {
      const values = announcementSchema.parse(announcementForm.getFieldsValue());
      if (announcementEditId) {
        await api.adminUpdateAnnouncement(announcementEditId, values);
      } else {
        await api.adminCreateAnnouncement(values);
      }
      message.success("公告已保存");
      setAnnouncementOpen(false);
      announcementForm.resetFields();
      setAnnouncementEditId(null);
      await loadAll();
    } catch (error) {
      message.error(pickErrorMsg(error));
    }
  }

  async function saveGuide() {
    try {
      const values = guideSchema.parse(guideForm.getFieldsValue());
      await api.adminUpdateGuide(values);
      message.success("参观指南已更新");
      await loadAll();
    } catch (error) {
      message.error(pickErrorMsg(error));
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-banner">
        <Typography.Title level={2}>后台管理</Typography.Title>
        <Typography.Paragraph>统一维护展品、展览、公告、指南、预约与评论。删除操作全部带确认提示，避免误删。</Typography.Paragraph>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} lg={4}>
          <Card className="soft-card"><Statistic title="用户数" value={overview?.user_total ?? 0} loading={busy} /></Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="soft-card"><Statistic title="展品数" value={overview?.exhibit_total ?? 0} loading={busy} /></Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="soft-card"><Statistic title="展览数" value={overview?.exhibition_total ?? 0} loading={busy} /></Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="soft-card"><Statistic title="预约数" value={overview?.visit_total ?? 0} loading={busy} /></Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="soft-card"><Statistic title="评论数" value={overview?.comment_total ?? 0} loading={busy} /></Card>
        </Col>
      </Row>

      <Tabs
        items={[
          {
            key: "exhibits",
            label: "展品管理",
            children: (
              <Card className="soft-card">
                <Space className="toolbar">
                  <Button type="primary" onClick={() => { setExhibitOpen(true); setExhibitEditId(null); exhibitForm.resetFields(); }}>
                    新增展品
                  </Button>
                </Space>
                <Table
                  rowKey="id"
                  scroll={{ x: 960 }}
                  dataSource={exhibits}
                  columns={[
                    { title: "名称", dataIndex: "name" },
                    { title: "年代", dataIndex: "era" },
                    { title: "类别", dataIndex: "category" },
                    { title: "展厅", dataIndex: "hall_name" },
                    { title: "评论数", dataIndex: "comments_count" },
                    {
                      title: "操作",
                      render: (_, row) => (
                        <Space>
                          <Button
                            onClick={() => {
                              setExhibitEditId(row.id);
                              exhibitForm.setFieldsValue(row);
                              setExhibitOpen(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            danger
                            onClick={() =>
                              confirmDelete("确认删除该展品吗？", "删除后相关评论也会一并清除。", async () => {
                                await api.adminDeleteExhibit(row.id);
                                message.success("展品已删除");
                                await loadAll();
                              })
                            }
                          >
                            删除
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "exhibitions",
            label: "展览管理",
            children: (
              <Card className="soft-card">
                <Space className="toolbar">
                  <Button type="primary" onClick={() => { setExhibitionOpen(true); setExhibitionEditId(null); exhibitionForm.resetFields(); }}>
                    新增展览
                  </Button>
                </Space>
                <Table
                  rowKey="id"
                  scroll={{ x: 960 }}
                  dataSource={exhibitions}
                  columns={[
                    { title: "标题", dataIndex: "title" },
                    { title: "地点", dataIndex: "location" },
                    { title: "状态", dataIndex: "status", render: (value: string) => <Tag>{value}</Tag> },
                    { title: "开始日期", dataIndex: "start_date" },
                    { title: "结束日期", dataIndex: "end_date" },
                    {
                      title: "操作",
                      render: (_, row) => (
                        <Space>
                          <Button
                            onClick={() => {
                              setExhibitionEditId(row.id);
                              exhibitionForm.setFieldsValue({
                                ...row,
                                start_date: dayjs(row.start_date),
                                end_date: dayjs(row.end_date),
                              });
                              setExhibitionOpen(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            danger
                            onClick={() =>
                              confirmDelete("确认删除该展览吗？", "删除后前台将不再展示该展览。", async () => {
                                await api.adminDeleteExhibition(row.id);
                                message.success("展览已删除");
                                await loadAll();
                              })
                            }
                          >
                            删除
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "announcements",
            label: "公告管理",
            children: (
              <Card className="soft-card">
                <Space className="toolbar">
                  <Button type="primary" onClick={() => { setAnnouncementOpen(true); setAnnouncementEditId(null); announcementForm.resetFields(); }}>
                    新增公告
                  </Button>
                </Space>
                <Table
                  rowKey="id"
                  scroll={{ x: 960 }}
                  dataSource={announcements}
                  columns={[
                    { title: "标题", dataIndex: "title" },
                    { title: "内容", dataIndex: "content", ellipsis: true },
                    { title: "置顶", dataIndex: "pinned", render: (value: boolean) => (value ? "是" : "否") },
                    {
                      title: "操作",
                      render: (_, row) => (
                        <Space>
                          <Button
                            onClick={() => {
                              setAnnouncementEditId(row.id);
                              announcementForm.setFieldsValue(row);
                              setAnnouncementOpen(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            danger
                            onClick={() =>
                              confirmDelete("确认删除该公告吗？", "删除后首页公告区会立即同步更新。", async () => {
                                await api.adminDeleteAnnouncement(row.id);
                                message.success("公告已删除");
                                await loadAll();
                              })
                            }
                          >
                            删除
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "guide",
            label: "参观指南",
            children: (
              <Card className="soft-card">
                <Form form={guideForm} layout="vertical">
                  <Form.Item label="开放时间" name="open_hours"><Input /></Form.Item>
                  <Form.Item label="馆址" name="address"><Input /></Form.Item>
                  <Form.Item label="交通方式" name="traffic_guide"><Input.TextArea rows={4} /></Form.Item>
                  <Form.Item label="票务说明" name="ticket_info"><Input.TextArea rows={4} /></Form.Item>
                  <Form.Item label="地图链接" name="map_link"><Input /></Form.Item>
                  <Form.Item label="参观须知" name="visit_tips"><Input.TextArea rows={5} /></Form.Item>
                  <Button type="primary" onClick={saveGuide}>保存参观指南</Button>
                </Form>
              </Card>
            ),
          },
          {
            key: "visits",
            label: "预约记录",
            children: (
              <Card className="soft-card">
                <Table
                  rowKey="id"
                  scroll={{ x: 960 }}
                  dataSource={visits}
                  columns={[
                    { title: "姓名", dataIndex: "visitor_name" },
                    { title: "电话", dataIndex: "phone" },
                    { title: "到馆日期", dataIndex: "visit_date" },
                    { title: "人数", dataIndex: "party_size" },
                    { title: "状态", dataIndex: "status" },
                    {
                      title: "操作",
                      render: (_, row) => (
                        <Button
                          danger
                          onClick={() =>
                            confirmDelete("确认删除该预约记录吗？", "删除后用户侧将同步看不到这条预约。", async () => {
                              await api.adminDeleteVisit(row.id);
                              message.success("预约记录已删除");
                              await loadAll();
                            })
                          }
                        >
                          删除
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "comments",
            label: "评论管理",
            children: (
              <Card className="soft-card">
                <Table
                  rowKey="id"
                  scroll={{ x: 960 }}
                  dataSource={comments}
                  columns={[
                    { title: "评论内容", dataIndex: "content", ellipsis: true },
                    { title: "展品 ID", dataIndex: "exhibit_id" },
                    { title: "用户 ID", dataIndex: "user_id" },
                    { title: "发布时间", dataIndex: "created_at" },
                    {
                      title: "操作",
                      render: (_, row) => (
                        <Button
                          danger
                          onClick={() =>
                            confirmDelete("确认删除该评论吗？", "删除后前台详情页将同步移除该评论。", async () => {
                              await api.adminDeleteComment(row.id);
                              message.success("评论已删除");
                              await loadAll();
                            })
                          }
                        >
                          删除
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={exhibitEditId ? "编辑展品" : "新增展品"}
        open={exhibitOpen}
        onCancel={() => setExhibitOpen(false)}
        onOk={saveExhibit}
        okText="保存"
        cancelText="取消"
        width={760}
      >
        <Form form={exhibitForm} layout="vertical">
          <Form.Item name="name" label="名称"><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="era" label="年代"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="category" label="类别"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="hall_name" label="展厅"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="summary" label="摘要"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="detail" label="详情"><Input.TextArea rows={5} /></Form.Item>
          <Form.Item name="image_url" label="图片地址"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={exhibitionEditId ? "编辑展览" : "新增展览"}
        open={exhibitionOpen}
        onCancel={() => setExhibitionOpen(false)}
        onOk={saveExhibition}
        okText="保存"
        cancelText="取消"
        width={760}
      >
        <Form form={exhibitionForm} layout="vertical">
          <Form.Item name="title" label="标题"><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="location" label="地点"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="status" label="状态"><Select options={[{ value: "展出中" }, { value: "即将开展" }, { value: "已结束" }]} /></Form.Item></Col>
            <Col span={4}><Form.Item name="start_date" label="开始日期"><DatePicker className="full-width" /></Form.Item></Col>
            <Col span={4}><Form.Item name="end_date" label="结束日期"><DatePicker className="full-width" /></Form.Item></Col>
          </Row>
          <Form.Item name="summary" label="简介"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="poster_url" label="海报地址"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={announcementEditId ? "编辑公告" : "新增公告"}
        open={announcementOpen}
        onCancel={() => setAnnouncementOpen(false)}
        onOk={saveAnnouncement}
        okText="保存"
        cancelText="取消"
      >
        <Form form={announcementForm} layout="vertical" initialValues={{ pinned: false }}>
          <Form.Item name="title" label="标题"><Input /></Form.Item>
          <Form.Item name="content" label="内容"><Input.TextArea rows={5} /></Form.Item>
          <Form.Item name="pinned" label="置顶显示" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
