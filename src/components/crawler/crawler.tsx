import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

import {
  extractSymbols,
  sanitizeSymbols,
  searchSubmissions,
  Submission,
} from '../../utils/pushshift';
import { db } from '../../models/db';

import './crawler.css';

export const Crawler: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function crawl() {
    const submissions = await searchSubmissions(new Date(2021, 0, 16), 'pennystocks');
    setSubmissions(submissions);
    console.log(submissions);
    let symbols = extractSymbols(submissions);
    console.log(symbols);
    symbols = await sanitizeSymbols(symbols);
    console.log(symbols);

    await db.redditSymbols.bulkAdd(symbols);
  }

  return <Button onClick={() => crawl()}>Crawl</Button>;
};
