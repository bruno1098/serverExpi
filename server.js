const http = require('http');
const WebSocket = require('ws');

// Defina a porta do Heroku
const PORT = process.env.PORT || 8080;

// Crie um servidor HTTP simples
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Servidor WebSocket está rodando\n');
});

// Inicialize o WebSocket Server com o servidor HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');
  
  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);
    // Enviar mensagem para todos os outros clientes conectados
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

// Faça o servidor HTTP escutar na porta
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
