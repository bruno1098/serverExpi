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

// Porta dinâmica do Heroku ou local (8080)
const PORT = process.env.PORT || 8080;

// Criação do servidor WebSocket sobre o HTTP
const wss = new WebSocket.Server({ noServer: true });

// Mapa de usuários em cada canal
const users = {};

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

  // Atribui um ID único para o cliente
  ws.id = Math.random().toString(36).substring(2, 15);

  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);
    const data = JSON.parse(message);

    // Trata as mensagens
    if (data.type === 'join') {
      const channel = data.channel;
      if (!users[channel]) {
        users[channel] = [];
      }
      users[channel].push(ws);
      ws.send(JSON.stringify({
        type: 'users',
        users: users[channel].map((user) => user.id),
      }));
    } else if (data.type === 'leave') {
      const channel = data.channel;
      users[channel] = users[channel].filter((user) => user !== ws);
      // Avisar os outros usuários do canal sobre a saída
      users[channel].forEach((user) => {
        if (user !== ws) {
          user.send(JSON.stringify({
            type: 'users',
            users: users[channel].map((user) => user.id),
          }));
        }
      });
    } else if (data.type === 'signal') {
      const channel = data.channel;
      // Reenviar sinal para todos os outros usuários do canal
      users[channel].forEach((user) => {
        if (user !== ws) {
          user.send(JSON.stringify({
            type: 'signal',
            data: data.data,
            channel: channel,
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    // Remover o cliente de todos os canais em que ele está
    for (const channel in users) {
      users[channel] = users[channel].filter((user) => user !== ws);
      // Avisar os outros usuários do canal sobre a saída
      users[channel].forEach((user) => {
        if (user !== ws) {
          user.send(JSON.stringify({
            type: 'users',
            users: users[channel].map((user) => user.id),
          }));
        }
      });
    }
  });
});

// Iniciar o servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});