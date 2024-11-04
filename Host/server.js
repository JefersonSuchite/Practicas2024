// Archivo server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = [];
let files = []; // Historial de archivos

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Manejar nuevo usuario
    socket.on('user joined', (username) => {
        socket.username = username;
        users.push(username);
        io.emit('update user list', users);
        // Enviar historial de archivos al nuevo usuario
        socket.emit('file history', files);
    });

    // Cambiar nombre de usuario
    socket.on('change username', ({ oldUsername, newUsername }) => {
        users = users.map((user) => (user === oldUsername ? newUsername : user));
        socket.username = newUsername;
        io.emit('update user list', users);
        io.emit('chat message', { username: 'Sistema', message: `${oldUsername} ahora es ${newUsername}` });
    });

    // Recibir mensaje
    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    // Recibir archivo
    socket.on('file upload', (file) => {
        files.push(file); // Guardar archivo en el historial
        io.emit('file upload', file); // Enviar archivo a todos los usuarios
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        users = users.filter((user) => user !== socket.username);
        io.emit('update user list', users);
        console.log('Usuario desconectado');
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en http://0.0.0.0:${PORT}`);
});
