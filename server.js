/**
 * Created by Noor on 2017-03-07.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT||3000);

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html')
});


io.sockets.on('connection',function(socket){
    connections.push(socket);
    users.push(createUniqueUsername());
    // New User
    socket.username = users[users.length-1];
    socket.emit('get user', socket.username);
    updateUsernames(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //Disconnect
    socket.on('disconnect',function (data) {
        users.splice(users.indexOf(connections.indexOf(socket.username),1));
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnect: %s sockets connected',connections.length);
    });

    //Send Message
    socket.on('send message', function(data){
        io.sockets.emit('new message', {msg:data,time:getTime(),username:socket.username});
    });
});

function getTime(){
    var timeStamp = [];
    var date = new Date();
    timeStamp[0] = date.getHours();
    timeStamp[1] = date.getMinutes();
    return timeStamp;

}

function updateUsernames(socket){
    io.sockets.emit('get users',{users:users,currentUser:socket.username});
}

function createUniqueUsername(){
    var id = Math.round(Math.random()*10);
    var iterations = 0;
    while(iterations < users.length){
        for(i = 0; i < users.length;i++){
            if(id === users[i]) {
                id = Math.round(Math.random() * 10);
                iterations = 0;
                break;
            }
            else{
                iterations++;
            }
        }
    }

    return id;

}