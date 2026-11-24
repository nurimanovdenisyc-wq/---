const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname)));

const players = {};

io.on('connection', (socket) => {
  console.log('Игрок подключился:', socket.id);

  players[socket.id] = { x: 0, y: 0, z: 5, hp: 100, name: 'Игрок' };

  socket.on('join', (data) => {
    if (players[socket.id]) {
      players[socket.id].name = data.name;
    }
  });

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].z = data.z;
      players[socket.id].rotY = data.rotY;
    }
  });

  socket.on('attack', (targetId) => {
    if (players[targetId] && players[socket.id]) {
      players[targetId].hp -= 10;
      if (players[targetId].hp <= 0) {
        players[targetId].hp = 100;
      }
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit('state', players);
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
