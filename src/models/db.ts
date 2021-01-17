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
      redditSymbols: 'symbol',
    });
  }
}

export const db = new StocksWatchlistDB();

export function resetDatabase() {
  return db.transaction('rw', db.redditSymbols, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
  });
}
