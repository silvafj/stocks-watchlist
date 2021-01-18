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
  const [enabled, setEnabled] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let intervalId: number | undefined;

    if (enabled) {
      intervalId = window.setInterval(() => crawl(), 1000 * 60 * 5);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [enabled]);

  async function crawl() {
    setFetching(true);

    const month_ago = new Date();
    month_ago.setMonth(month_ago.getMonth() - 1);
    const lastSymbol = await db.redditSymbols.orderBy('created_utc').last();
    const startDate = lastSymbol ? new Date(lastSymbol.created_utc * 1000) : month_ago;
    console.log(startDate);

    const submissions = await searchSubmissions(startDate, 'pennystocks');
    let symbols = extractSymbols(submissions);
    symbols = await sanitizeSymbols(symbols);
    try {
      await db.redditSymbols.bulkAdd(symbols);
    } catch (error) {
      console.log(error);
    }

    setFetching(false);
  }

  return (
    <div className='crawler'>
      <Switch onChange={checked => setEnabled(checked)} loading={fetching} checked={enabled} />
    </div>
  );
};
