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

// Função para monitorar conexões WebSocket inativas
const monitorConnections = () => {
  wss.clients.forEach((client) => {
    if (client.isAlive === false) {
      console.log('Conexão inativa removida');
      return client.terminate();
    }
    client.isAlive = false;
    client.ping(() => {}); // Envia um ping para verificar se a conexão está viva
  });
};

// Intervalo para verificar as conexões a cada 30 segundos
const interval = setInterval(monitorConnections, 30000);

// Configuração do WebSocket
wss.on('connection', (ws) => {
  console.log('Novo cliente WebSocket conectado');
  ws.isAlive = true; // Define a conexão como ativa

  // Ao receber um pong (resposta ao ping), marque a conexão como ativa
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Tratamento de mensagens
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message); // Converte a mensagem para JSON
      console.log('Mensagem recebida:', data);

      // Enviar uma confirmação (ACK) de que a mensagem foi recebida
      ws.send(JSON.stringify({ type: 'ack', status: 'received', id: data.id }));

      if (data.type && data.signalData) {
        // Enviar a mensagem para todos os outros clientes conectados
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar a mensagem recebida:', error);
    }
  });

  // Tratamento de desconexão
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });

  // Tratamento de erros
  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
});

// Iniciar o servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Quando o servidor é fechado, limpa o intervalo de monitoramento
wss.on('close', () => {
  clearInterval(interval);
});
