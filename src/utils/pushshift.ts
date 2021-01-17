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

  const url_unnescaped = url.toString().replaceAll('%2C', ',');
  console.log(url_unnescaped);

  const submissions = await fetchJSON<SearchSubmissionResponse>(url_unnescaped);
  return submissions.data;
}

export interface SymbolInfo {
  symbol: string;
  mentioned_in: 'submission' | 'comment';
  url: string;
  author: string;
  link_flair_text: string;
  score: number;
  created_utc: number;
  rockets: number;
}

export function extractSymbols(submissions: Submission[]): SymbolInfo[] {
  const pattern = new RegExp('\\$?([0-9A-Z]{1,5}|[0-9]{6})(\\.[A-Z]{1,2})?(?![\\w])', 'g');
  const rocket_symbol = new RegExp('🚀', 'g');

  const symbols: SymbolInfo[] = [];
  submissions.forEach(submission => {
    const full_text = ' ' + submission.title + ' ' + submission.selftext + ' ';
    const submission_symbols = new Set(full_text.match(pattern) || []);
    const rockets_count = (full_text.match(rocket_symbol) || []).length;

    submission_symbols.forEach(symbol =>
      symbols.push({
        symbol: symbol.toUpperCase().trim().replace(/^\$+/g, ''),
        mentioned_in: 'submission',
        author: submission.author,
        created_utc: submission.created_utc,
        link_flair_text: submission.link_flair_text,
        score: submission.score,
        rockets: rockets_count,
        url: submission.url,
      }),
    );
  });

  return symbols;
}

export async function sanitizeSymbols(symbols: SymbolInfo[]): Promise<SymbolInfo[]> {
  if (symbols.length == 0) {
    return symbols;
  }

  const unique_symbols = new Set(symbols.map(mention => mention.symbol));

  const response = await yahooQuote(Array.from(unique_symbols.values()));
  const valid_symbols = response.result
    .filter(quote => quote.quoteType == 'EQUITY')
    .map(quote => quote.symbol);

  return symbols.filter(mention => valid_symbols.includes(mention.symbol));
}
