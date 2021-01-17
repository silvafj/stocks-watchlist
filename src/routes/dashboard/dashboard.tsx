import React, { useState } from 'react';
import { Card, Col, Row, Table } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../models/db';
import dateformat from 'dateformat';

import './dashboard.css';

interface SymbolAgg {
  key: string;
  symbol: string;
  mentions: number;
  last_mention: string;
}

export const Dashboard: React.FC = () => {
  const latestSymbols = useLiveQuery(() =>
    db.redditSymbols.orderBy('created_utc').reverse().limit(10).toArray(),
  );

  async function querySymbolStats(): Promise<Array<SymbolAgg>> {
    const counts: Record<string, number> = {};
    const last_mention: Record<string, number> = {};

    await db.redditSymbols.each(row => {
      counts[row.symbol] = (counts[row.symbol] || 0) + 1;
      last_mention[row.symbol] = Math.max(last_mention[row.symbol] || 0, row.created_utc);
    });

    const aggregatedSymbols: Array<SymbolAgg> = [];
    for (const symbol in counts) {
      aggregatedSymbols.push({
        key: symbol,
        symbol: symbol,
        mentions: counts[symbol],
        last_mention: dateformat(last_mention[symbol] * 1000, 'yyyy-mm-dd hh:MM'),
      });
    }
    return aggregatedSymbols;
  }

  const symbolStats = useLiveQuery(() => querySymbolStats());

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '# Mentions',
      dataIndex: 'mentions',
      key: 'mentions',
      sorter: (a: SymbolAgg, b: SymbolAgg) => a.mentions - b.mentions,
    },
    {
      title: 'Last mention',
      dataIndex: 'last_mention',
      key: 'last_mention',
    },
  ];

  return (
    <div>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span='18'>
          <Table dataSource={symbolStats} columns={columns} />
        </Col>
        <Col span='6'>
          <Card title='Latest mentions' bordered={false} size='small'>
            {(latestSymbols || []).map((mention, index) => (
              <div key={index}>
                <a href={mention.url || ''} target='_blank' rel='noreferrer'>
                  {mention.symbol}
                </a>
                {' @ '}
                {dateformat(mention.created_utc * 1000, 'yyyy-mm-dd hh:MM')}
                {' / '}
                {mention.link_flair_text}
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>Selected ticker graph</Col>
        <Col>Selected ticker all mentions</Col>
      </Row>
    </div>
  );
};
