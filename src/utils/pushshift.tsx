import { fetchJSON } from './http';
import { yahooQuote } from './yahoo';
// import alphavantage from 'alphavantage';

interface SearchSubmissionResponse {
  data: Submission[];
}

export interface Submission {
  url: string;
  author: string;
  title: string;
  link_flair_text: string;
  selftext: string;
  score: number;
  created_utc: number;
}

export async function searchSubmissions(startAt: Date, subreddit: string): Promise<Submission[]> {
  const url = new URL('https://api.pushshift.io/reddit/search/submission/');
  url.searchParams.append('subreddit', subreddit);
  url.searchParams.append('after', String(Math.floor(startAt.getTime() / 1000)));
  url.searchParams.append(
    'fields',
    ['url', 'author', 'title', 'link_flair_text', 'selftext', 'score', 'created_utc'].join(','),
  );
  url.searchParams.append('size', '5');

  const url_unnescaped = url.toString().replaceAll('%2C', ',');

  const submissions = await fetchJSON<SearchSubmissionResponse>(url_unnescaped);
  return submissions.data;
}

export interface TickerInfo {
  ticker: string;
  url: string;
  author: string;
  link_flair_text: string;
  score: number;
  created_utc: number;
  rockets: number;
}

export function extractTickers(submissions: Submission[]): TickerInfo[] {
  const pattern = new RegExp('\\s[A-Z]{3,5}\\s', 'g');
  const rocket_symbol = new RegExp('🚀', 'g');

  const tickers: TickerInfo[] = [];
  submissions.forEach(submission => {
    const full_text = ' ' + submission.title + ' ' + submission.selftext + ' ';
    const submission_tickers = new Set(full_text.match(pattern) || []);
    const rockets_count = (full_text.match(rocket_symbol) || []).length;

    submission_tickers.forEach(ticker =>
      tickers.push({
        ticker: ticker.toUpperCase().trim(),
        author: submission.author,
        created_utc: submission.created_utc,
        link_flair_text: submission.link_flair_text,
        score: submission.score,
        rockets: rockets_count,
        url: submission.url,
      }),
    );
  });

  return tickers;
}

export async function sanitizeTickers(tickers: TickerInfo[]): Promise<TickerInfo[]> {
  const unique_tickers = new Set(tickers.map(mention => mention.ticker));

  const response = await yahooQuote(Array.from(unique_tickers.values()));
  console.log(response);
  const valid_tickers = response.result
    .filter(quote => quote.quoteType == 'EQUITY')
    .map(quote => quote.symbol);
  console.log(valid_tickers);

  return tickers.filter(mention => valid_tickers.includes(mention.ticker));
}
