const http = require('http');
const WebSocket = require('ws');

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
  // Rota simples para verificação
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor WebSocket ativo');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 8080;

// Criar o servidor WebSocket usando o servidor HTTP
const wss = new WebSocket.Server({ server });

// Configuração do WebSocket
wss.on('connection', (ws) => {
  console.log('Novo cliente WebSocket conectado');

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
    console.log('Cliente WebSocket desconectado');
  });
});

// Iniciar o servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
