import { CalendarOutlined, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Empty, Input, List, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { api } from "../api/services";
import type { ExhibitionItem } from "../api/types";

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

  return (
    <div className="page-wrap">
      <div className="page-banner">
        <Typography.Title level={2}>展览信息</Typography.Title>
        <Typography.Paragraph>查看当前与即将开展的主题展览，了解展期、地点与亮点内容。</Typography.Paragraph>
        <Input
          size="large"
          value={keyword}
          prefix={<SearchOutlined />}
          placeholder="请输入展览名称或地点"
          onChange={(event) => setKeyword(event.target.value)}
          onPressEnter={() => loadData(keyword)}
        />
      </div>
      <Card className="soft-card">
        {loading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : rows.length === 0 ? (
          <Empty description="暂无展览信息" />
        ) : (
          <List
            dataSource={rows}
            renderItem={(item) => (
              <List.Item className="expo-row expo-list-row">
                <img alt={item.title} src={item.poster_url} className="poster-thumb poster-large" />
                <div className="expo-copy">
                  <Space wrap>
                    <Tag color={item.status === "展出中" ? "green" : item.status === "即将开展" ? "blue" : "default"}>
                      {item.status}
                    </Tag>
                    <Space>
                      <EnvironmentOutlined />
                      <span>{item.location}</span>
                    </Space>
                  </Space>
                  <Typography.Title level={4}>{item.title}</Typography.Title>
                  <Typography.Paragraph>{item.summary}</Typography.Paragraph>
                  <Space className="meta-line">
                    <CalendarOutlined />
                    <span>
                      {dayjs(item.start_date).format("YYYY年MM月DD日")} 至 {dayjs(item.end_date).format("YYYY年MM月DD日")}
                    </span>
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

