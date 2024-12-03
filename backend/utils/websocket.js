const WebSocket = require('ws');
let wss;

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        ws.userId = data.userId;
      }
    });
  });
};

const notifyUser = (userId, data) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const broadcastToAdmin = (data) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = {
  initializeWebSocket,
  notifyUser,
  broadcastToAdmin
}; 