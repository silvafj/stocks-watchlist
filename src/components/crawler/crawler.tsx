import React, { useEffect, useState } from 'react';
import { Switch } from 'antd';

import {
  extractSymbols,
  sanitizeSymbols,
  searchSubmissions,
  Submission,
} from '../../utils/pushshift';
import { db } from '../../models/db';

import './crawler.css';

export const Crawler: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    let intervalId: number | undefined;

    if (enabled) {
      intervalId = window.setInterval(() => crawl(), 1000 * 20);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [enabled]);

  async function crawl() {
    setFetching(true);

    const lastSymbol = await db.redditSymbols.orderBy('created_utc').last();
    const startDate = lastSymbol ? new Date(lastSymbol.created_utc * 1000) : new Date(2021, 0, 1);
    console.log(startDate);

    const submissions = await searchSubmissions(startDate, 'pennystocks');
    let symbols = extractSymbols(submissions);
    symbols = await sanitizeSymbols(symbols);
    await db.redditSymbols.bulkAdd(symbols);

    setFetching(false);
  }

  return (
    <div className='crawler'>
      <Switch onChange={checked => setEnabled(checked)} loading={fetching} checked={enabled} />
    </div>
  );
};
