const http = require('http');
const WebSocket = require('ws');

// Utilize a porta fornecida pelo Heroku
const PORT = process.env.PORT || 8080;

// Crie um servidor HTTP simples
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor WebSocket ativo\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada\n');
  }
});

// Inicialize o WebSocket Server com o servidor HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);
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

// Escute na porta designada pelo Heroku
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
