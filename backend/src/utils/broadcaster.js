/**
 * Lightweight Server-Sent Events (SSE) Real-Time Broadcaster.
 * Enables zero-dependency, real-time live synchronization across all connected dashboards.
 */

const clients = new Set();

/**
 * Registers an SSE client connection.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function registerStreamClient(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  // Send initial ping to confirm stream
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time SSE availability stream connected' })}\n\n`);

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
}

/**
 * Broadcasts an event to all connected dashboard clients.
 * @param {object} payload
 */
export function broadcastEvent(payload) {
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) {
    try {
      client.write(message);
    } catch (err) {
      clients.delete(client);
    }
  }
}

/**
 * Returns number of currently active streaming clients.
 */
export function getActiveClientsCount() {
  return clients.size;
}
