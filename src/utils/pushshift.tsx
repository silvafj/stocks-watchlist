import { fetchJSON } from './http';

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

  const submissions = await fetchJSON<SearchSubmissionResponse>(url_unnescaped);
  return submissions.data;
}
