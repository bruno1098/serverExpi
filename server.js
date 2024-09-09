const http = require('http');
const WebSocket = require('ws');

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Servidor WebSocket está rodando!');
});

// Use a porta fornecida pelo Heroku ou padrão para 8080 em desenvolvimento local
const PORT = process.env.PORT || 8080;

// Criar o servidor WebSocket usando o servidor HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);

    // Enviar mensagem para todos os clientes conectados
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

// Escutar a porta correta
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
