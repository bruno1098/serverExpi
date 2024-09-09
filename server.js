const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);
    // Aqui, transmitimos a mensagem para todos os clientes conectados
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('error', (error) => {
    console.error('Erro na conexão WebSocket:', error);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

console.log('Servidor WebSocket rodando na porta 8080');
