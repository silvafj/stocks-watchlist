import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

import './crawler.css';
import {
  extractTickers,
  sanitizeTickers,
  searchSubmissions,
  Submission,
} from '../../utils/pushshift';

export const Crawler: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  async function crawl() {
    const submissions = await searchSubmissions(new Date(2021, 0, 16), 'pennystocks');
    setSubmissions(submissions);
    console.log(submissions);
    let tickers = extractTickers(submissions);
    console.log(tickers);
    tickers = await sanitizeTickers(tickers);
    console.log(tickers);
  }

  return <Button onClick={() => crawl()}>Crawl</Button>;
};
