import Dexie, { Table } from 'dexie';
import { SymbolInfo } from '../utils/pushshift';

/**
 * Based on https://medium.com/dexie-js/awesome-react-integration-coming-f212c2273d05
 */
export class StocksWatchlistDB extends Dexie {
  redditSymbols!: Table<SymbolInfo, number>;

  constructor() {
    super('StocksWatchlistDB');

    this.version(1).stores({
      redditSymbols: '[symbol+url], symbol',
    });
  }
}

export const db = new StocksWatchlistDB();