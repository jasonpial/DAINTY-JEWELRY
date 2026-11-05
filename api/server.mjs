import { createServer } from 'node:http';
import { handleApiRequest } from './handler.js';

const PORT = Number(process.env.API_PORT || 8787);

createServer(async (req, res) => {
  await handleApiRequest(req, res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`DAINTY payment API listening on http://0.0.0.0:${PORT}`);
});
