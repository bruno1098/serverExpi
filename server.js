const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

// Carregar certificados SSL
const options = {
  key: fs.readFileSync('path/to/your/ssl.key'),
  cert: fs.readFileSync('path/to/your/ssl.crt')
};

// Criar o servidor HTTPS
const server = https.createServer(options, (req, res) => {
  // Rota simples para verificação
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor WebSocket ativo');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Resto do código permanece o mesmo...


// Porta dinâmica do Heroku ou local (8080)
const PORT = process.env.PORT || 8080;

// Criação do servidor WebSocket sobre o HTTP
const wss = new WebSocket.Server({ noServer: true });

// Lidar com a requisição de upgrade para WebSocket
server.on('upgrade', (req, socket, head) => {
  
  if (req.url === '/ws') {  // Rota específica para o WebSocket
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

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
