import Dexie, { Table } from 'dexie';
import { SymbolInfo } from '../utils/pushshift';

interface BannedSymbolsRow {
  symbol: string;
}

/**
 * Based on https://medium.com/dexie-js/awesome-react-integration-coming-f212c2273d05
 */
export class StocksWatchlistDB extends Dexie {
  redditSymbols!: Table<SymbolInfo, string>;
  bannedSymbols!: Table<BannedSymbolsRow, string>;

  constructor() {
    super('StocksWatchlistDB');

    this.version(1).stores({
      redditSymbols: '[symbol+url], symbol, created_utc',
    });
    this.version(2).stores({
      bannedSymbols: '[symbol]',
    });
  }
}

export const db = new StocksWatchlistDB();
