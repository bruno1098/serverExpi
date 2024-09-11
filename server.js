const http = require('http');
const WebSocket = require('ws');

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor WebSocket ativo');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Porta dinâmica do Heroku ou local (8080)
const PORT = process.env.PORT || 8080;

// Criação do servidor WebSocket sobre o HTTP
const wss = new WebSocket.Server({ noServer: true });

// Lidar com a requisição de upgrade para WebSocket
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Associar um id a cada cliente conectado
let clientId = 0;
const clients = {};

// Configuração do WebSocket
wss.on('connection', (ws) => {
  clientId++;
  const userId = `user-${clientId}`;
  clients[userId] = ws; // Armazena o cliente pelo ID

  console.log(`Novo cliente WebSocket conectado: ${userId}`);

  // Quando uma mensagem é recebida
  ws.on('message', (message) => {
    console.log(`Mensagem recebida de ${userId}:`, message);

    const parsedMessage = JSON.parse(message);

    // Enviar a mensagem para o cliente alvo (target), se especificado
    if (parsedMessage.targetId && clients[parsedMessage.targetId]) {
      const targetClient = clients[parsedMessage.targetId];
      if (targetClient.readyState === WebSocket.OPEN) {
        targetClient.send(message); // Enviar a mensagem apenas ao peer específico
      }
    } else {
      // Caso não haja um target específico, envia para todos menos o próprio cliente
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`Cliente WebSocket desconectado: ${userId}`);
    delete clients[userId]; // Remove o cliente desconectado
  });
});

// Iniciar o servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
