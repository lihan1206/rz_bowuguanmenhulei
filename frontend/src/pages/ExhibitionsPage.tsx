import { CalendarOutlined, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Input, List, Skeleton, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";

import { api } from "../api/services";
import type { ExhibitionItem } from "../api/types";
import { excerpt, formatDateRange, statusColor } from "../utils/museum";

export function ExhibitionsPage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ExhibitionItem[]>([]);

  async function loadData(q = "") {
    setLoading(true);
    try {
      setRows(await api.exhibitions(q));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const statusCounts = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  return (
    <div className="page-wrap">
      <div className="page-banner">
        <div className="banner-copy">
          <Typography.Title level={2}>展览信息</Typography.Title>
          <Typography.Paragraph>
            通过展览列表查看当前展出和即将开展的主题展，快速掌握地点、时间和内容亮点。
          </Typography.Paragraph>
        </div>
        <Input
          size="large"
          value={keyword}
          prefix={<SearchOutlined />}
          placeholder="请输入展览名称或地点"
          onChange={(event) => setKeyword(event.target.value)}
          onPressEnter={() => loadData(keyword)}
        />
      </div>

      <div className="toolbar">
        <Space wrap>
          <Tag color="green">展出中 {statusCounts["展出中"] ?? 0}</Tag>
          <Tag color="blue">即将开展 {statusCounts["即将开展"] ?? 0}</Tag>
          <Tag color="default">已结束 {statusCounts["已结束"] ?? 0}</Tag>
          <Button size="small" onClick={() => loadData(keyword)}>
            刷新结果
          </Button>
        </Space>
      </div>

      <Card className="soft-card">
        {loading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : rows.length === 0 ? (
          <Empty description="暂无展览信息">
            <Button type="primary" onClick={() => loadData()}>
              重新加载
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={rows}
            renderItem={(item) => (
              <List.Item className="expo-row expo-list-row">
                <img alt={item.title} src={item.poster_url} className="poster-thumb poster-large" />
                <div className="expo-copy">
                  <Space wrap>
                    <Tag color={statusColor(item.status)}>{item.status}</Tag>
                    <Space className="meta-line">
                      <EnvironmentOutlined />
                      <span>{item.location}</span>
                    </Space>
                  </Space>
                  <Typography.Title level={4}>{item.title}</Typography.Title>
                  <Typography.Paragraph>{excerpt(item.summary, 180)}</Typography.Paragraph>
                  <Space className="meta-line">
                    <CalendarOutlined />
                    <span>{formatDateRange(item.start_date, item.end_date)}</span>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
