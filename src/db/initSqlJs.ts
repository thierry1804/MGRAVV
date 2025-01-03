import initSqlJs from 'sql.js';

let SQL: typeof import('sql.js');
let initialized = false;

export async function initSQL() {
  if (initialized) return SQL;
  
  SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  initialized = true;
  return SQL;
}