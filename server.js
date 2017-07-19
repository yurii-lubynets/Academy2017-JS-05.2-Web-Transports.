const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));

const server = require('http').Server(app);
const io = require('socket.io')(server);

let users =[];
let connections = [];
let messages = [];

io.sockets.on('connection', (socket) => {
    
    connections.push(socket);

    const updateUsernames = () => {
        io.sockets.emit('get users', users);
    };
    const loadMessageHistory = () => {
        console.log(messages);
        io.sockets.emit('messageHistory', messages);
    };
    const changeStatus = (user) => {
        user.status = 'online';
        updateUsernames();
    };

    socket.on('disconnect', (data) => {
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
    });
    socket.on('send', (socket) => {
        if(messages.length >= 100) {
            messages.shift();
        }
        messages.push(socket);
        io.sockets.emit('messageHistory', messages);
    });
    socket.on('new user', (socket) => {
        users.push(socket);
        updateUsernames();
        loadMessageHistory();
        setTimeout(() => { changeStatus(socket) }, 60000);
    });
    socket.on('change to offline', (user) => {
        user.status = 'offline';
        let index = users.indexOf(user.userNickName);
        users.splice(index, 1, user);
        updateUsernames();
    });
    socket.on('is typing', (data) => {
        socket.broadcast.emit('typing', {nickname: data.userNickName});
    });
});
server.listen(8080);

