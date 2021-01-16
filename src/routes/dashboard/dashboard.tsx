import React, { useState } from 'react';
import { Button, Layout } from 'antd';

import './dashboard.css';
import { searchSubmissions } from '../../utils/pushshift';

async function crawl() {
  const submissions = await searchSubmissions(new Date(2021, 0, 16), 'pennystocks');
  console.log(submissions);
}

function parseTickers(submissions: string[]) {
  // pattern = re.compile(StockCrawler.STOCK_TICKER_PATTERN)
  // tickers = []
  // for submission in submissions:
  //     selftext = submission.selftext if hasattr(submission, 'selftext') else ''
  //     link_flair_text = submission.link_flair_text if hasattr(submission, 'link_flair_text') else ''
  //     submission_tickers = set(
  //         pattern.findall(submission.title) +
  //         pattern.findall(selftext))
  //     rockets_count = (submission.title.count(StockCrawler.ROCKET_SYMBOL) +
  //         selftext.count(StockCrawler.ROCKET_SYMBOL))
  //     for ticker in submission_tickers:
  //         tickers.append({
  //             "ticker": ticker.upper(),
  //             "author": submission.author,
  //             "created_utc": submission.created_utc,
  //             "link_flair_text": link_flair_text,
  //             "score": submission.score,
  //             "rockets": rockets_count,
  //             "url": submission.url,
  //         })
  // return tickers
}

export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <Button onClick={() => crawl()}>crawl</Button>
    </Layout>
  );
};
