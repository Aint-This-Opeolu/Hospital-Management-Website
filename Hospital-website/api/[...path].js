import app from '../server/index.cjs';
import dbModule from '../server/db.cjs';

let databaseReady;

export default async function handler(request, response) {
  databaseReady ||= dbModule.migrate();
  await databaseReady;
  return app(request, response);
}