import React, { useState } from 'react';
import { Card, Col, Row, Space, Table } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../models/db';
import dateformat from 'dateformat';

import './dashboard.css';
import { SymbolInfo } from '../../utils/pushshift';

interface SymbolAgg {
  key: string;
  symbol: string;
  mentions: number;
  last_mention: string;
}

export const Dashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const latestSymbols = useLiveQuery(() =>
    db.redditSymbols.orderBy('created_utc').reverse().limit(15).toArray(),
  );

  const symbolMentions = useLiveQuery(async () => {
    const mentions = await db.redditSymbols.where('symbol').equals(selectedSymbol);
    const sorted = await mentions.sortBy('created_utc');
    return sorted.reverse();
  }, [selectedSymbol]);

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

  async function deleteInvalidSymbols(symbol: string) {
    await db.redditSymbols.where('symbol').equals(symbol).delete();
  }

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      sorter: (a: SymbolAgg, b: SymbolAgg) => a.symbol.localeCompare(b.symbol),
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
    {
      title: 'Actions',
      key: 'actions',
      // eslint-disable-next-line react/display-name
      render: (text: string, record: SymbolAgg) => (
        <Space size='middle'>
          <a key={record.symbol} onClick={() => deleteInvalidSymbols(record.symbol)}>
            Delete
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span='18'>
          <Table
            dataSource={symbolStats}
            columns={columns}
            rowSelection={{
              type: 'radio',
              onChange: (selectedRowKeys: React.Key[], selectedRows: SymbolAgg[]) => {
                setSelectedSymbol(selectedRows[0].symbol);
              },
            }}
          />
        </Col>
        <Col span='6'>
          <Card title='Latest mentions' bordered={false} size='small' className='latest-mentions'>
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
        <Col>
          <Card title='Symbol mentions' bordered={false} size='small' className='symbol-mentions'>
            {(symbolMentions || []).map((mention, index) => (
              <div key={index}>
                <a href={mention.url || ''} target='_blank' rel='noreferrer'>
                  {dateformat(mention.created_utc * 1000, 'yyyy-mm-dd hh:MM')}
                </a>
                {' / '}
                {mention.link_flair_text}
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
