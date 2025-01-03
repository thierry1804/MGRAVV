import { Database } from 'sql.js';

export function executeQuery<T>(db: Database, query: string, params: any[] = []): T[] {
  const results = db.exec(query, params);
  return results[0]?.values.map((row) => row as unknown as T) || [];
}

export function executeWrite(db: Database, query: string, params: any[] = []): void {
  db.run(query, params);
}