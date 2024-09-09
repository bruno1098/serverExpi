const http = require('http');
const WebSocket = require('ws');

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end('Not Found');
});

// Use a porta fornecida pelo Heroku ou padrão para 8080 em desenvolvimento local
const PORT = process.env.PORT || 8080;

// Criar o servidor WebSocket com base no servidor HTTP
const wss = new WebSocket.Server({ noServer: true });

// Lidar com as conexões WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);

    // Enviar a mensagem para todos os clientes conectados
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar o servidor na porta correta
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
