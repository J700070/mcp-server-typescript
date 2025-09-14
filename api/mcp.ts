export const config = { runtime: 'nodejs20.x' };

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { initializeFieldConfiguration } from '../src/core/config/field-configuration.js';
import { initMcpServer } from '../src/main/init-mcp-server.js';

function parseBasicAuth(header?: string): { username?: string; password?: string } {
  if (!header || !header.startsWith('Basic ')) return {};
  const base64 = header.split(' ')[1] || '';
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');
  return { username, password };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null });
    return;
  }

  try {
    initializeFieldConfiguration();

    let { username, password } = parseBasicAuth(req.headers.authorization as string | undefined);
    if (!username || !password) {
      username = process.env.DATAFORSEO_USERNAME;
      password = process.env.DATAFORSEO_PASSWORD;
    }

    if (!username || !password) {
      res.status(401).json({ jsonrpc: '2.0', error: { code: -32001, message: 'Authentication required. Provide DataForSEO credentials.' }, id: null });
      return;
    }

    const server = initMcpServer(username, password);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    await server.connect(transport);
    await transport.handleRequest(req as any, res as any, (req as any).body);
    (req as any).on?.('close', () => {
      try { transport.close(); } catch {}
      try { server.close(); } catch {}
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
    }
  }
}


