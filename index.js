const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
    }
});


app.use(cors());

let players = [];


io.on('connection', (socket) => {
    console.log('alguem conectou')

    socket.on('add', (player) => {
        console.log('Novo jogador adicionado: ', player.name)
        socket.emit('newPlayer', { player, players: players.filter(p => p.id !== player.id) });
        socket.broadcast.emit('somePlayerAdded', player);
        players.push(player);
    });

    socket.on('move', (info) => {
        players.forEach(p => {
            if (p.id === info.id) {
                p.position = info.position;
            }
        });

        socket.broadcast.emit('playerMove', {id: info.id, position: info.position});
    });

    socket.on('remove', (player) => {
        console.log('Player removed: ', player)
        players = players.filter(p => p.id !== player);
        socket.broadcast.emit('somePlayerRemoved', player);
    });


    socket.on('disconnect', () => {
        console.log('alguem saiu')
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('server is alive');
});