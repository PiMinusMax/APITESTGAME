import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { istApiPfad, verarbeiteApi } from './src/api.js';
import { statischeDatei } from './src/statisch.js';

export function erstelleServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (istApiPfad(url.pathname)) await verarbeiteApi(req, res, url);
      else await statischeDatei(req, res, url);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Interner Serverfehler');
    }
  });
}

const istHauptprogramm = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (istHauptprogramm) {
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  const server = erstelleServer();
  server.listen(port, host, () => {
    console.log(`🛰️  Mission Schnittstelle läuft auf http://localhost:${port}`);
  });
  const beenden = () => {
    server.close(() => process.exit(0));
    server.closeAllConnections?.();
  };
  process.on('SIGTERM', beenden);
  process.on('SIGINT', beenden);
}
