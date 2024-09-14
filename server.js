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

// Lidar com a requisição de upgrade para WebSocket
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws') {  // Rota específica para o WebSocket
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
  }
});

// Mapeamento de userId para WebSocket
const clients = {};

// Configuração do WebSocket
wss.on('connection', (ws) => {
  console.log('Novo cliente WebSocket conectado');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message); // Converte a mensagem para JSON
      console.log('Mensagem recebida:', data);

      if (data.type === 'register') {
        // Registrar o userId
        ws.userId = data.userId;
        clients[data.userId] = ws;
        console.log(`Usuário registrado: ${data.userId}`);
        return;
      }

      if (data.type === 'signal') {
        const targetUserId = data.targetUserId;
        const targetClient = clients[targetUserId];
        if (targetClient && targetClient.readyState === WebSocket.OPEN) {
          targetClient.send(JSON.stringify(data));
        } else {
          console.error(`Cliente com userId ${targetUserId} não encontrado ou desconectado.`);
        }
        return;
      }

      // Para outros tipos de mensagens (e.g., 'join', 'leave'), broadcast para todos os clientes
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });

    } catch (error) {
      console.error('Erro ao processar a mensagem recebida:', error);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`Cliente WebSocket desconectado. Código: ${code}, Razão: ${reason}`);
    // Remover o cliente do mapeamento
    if (ws.userId) {
      delete clients[ws.userId];
      console.log(`Usuário removido: ${ws.userId}`);
    }
  });

  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
});

// Iniciar o servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
