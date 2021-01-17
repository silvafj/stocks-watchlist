import React, { useState } from 'react';
import { Layout } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../models/db';

import './dashboard.css';

export const Dashboard: React.FC = () => {
  const redditSymbols = useLiveQuery(() => db.redditSymbols.toArray());

  return (
    <Layout>
      <ul>
        {(redditSymbols || []).map((mention, index) => (
          <li key={index}>
            {mention.symbol} | {mention.url}
          </li>
        ))}
      </ul>
    </Layout>
  );
};
