const http = require('http');
const WebSocket = require('ws');

// Criar um servidor HTTP que o Heroku entende
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Servidor WebSocket está rodando!');
});

// Porta dinâmica atribuída pelo Heroku ou localmente na 8080
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ server });

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

// Servidor deve ouvir na porta correta
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
