/**
 * Created by Noor on 2017-03-07.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];
messages = [];


server.listen(process.env.PORT||3000);

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html')
});


io.sockets.on('connection',function(socket){
    connections.push(socket);
    users.push("User" + createUniqueUsername()); // Create a unique username for the user

    // New User
    socket.username = users[users.length-1]; // Assign the username to socket
    socket.emit('get user', socket.username); // send it to client so that they know who the current user is
    updateUsernames(socket); // Send the client an updated list of usernames
    console.log('Connected: %s sockets connected', connections.length);

    //Disconnect
    socket.on('disconnect',function (data) {
        users.splice(users.indexOf(connections.indexOf(socket.username),1)); // remove user from user array
        connections.splice(connections.indexOf(socket),1); // remove connection
        console.log('Disconnect: %s sockets connected',connections.length);
    });

    //Send Message
    socket.on('send message', function(data){
        var color = 0;
        var res = checkUsernameChange(data); // Check if /nick was entered
        if(res) {
            changeUsername(data, socket); // If /nick was entered, change the username in socket and user
            socket.emit('get user', socket.username); // Let the client know that the username has changed
            updateUsernames(socket); // emit the new list of usernames
        }
        res = checkColorChange(data); // Check if /nickcolor was entered
        if(res){
            color = setColor(data); // if /nickcolor was entered, return the desired color
        }
        messages.push({msg:data,time:getTime(),username:socket.username,color:color});
            io.sockets.emit('new message', {msg:data,time:getTime(),username:socket.username,color:color});
    });
});


// Returns an array with time in minutes and hours
function getTime(){
    var timeStamp = [];
    var date = new Date();
    timeStamp[0] = date.getHours();
    timeStamp[1] = date.getMinutes();
    return timeStamp;

}

// Emits to client the list of users
function updateUsernames(socket){
    io.sockets.emit('get users',{users:users,currentUser:socket.username});
}


// Creates a unique username for the user (up to 10 users)
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

// Check if /nick was entered
function checkUsernameChange(data){
    data.toLowerCase();
    var result = data.match(/\/nick/i);
    if(result === null || result.length!=1)
        return false;
    else
        return true;
}
// Check if the username exists
function checkUsernameExist(data){
    for(i = 0; i < users.length; i++){
        if(data === users[i])
            return false;
    }
    return true;
}

//Change the username in socket and user
function changeUsername(data,socket){
    var nickname = data.split(" ");
    if (nickname.length > 1 && !(data.match(/\/nickcolor/i))){
        if(checkUsernameExist(nickname[1])) {
            users[users.indexOf(socket.username)] = nickname[1];
            socket.username = nickname[1];
        }
    }
}

// Check if /nickcolor was entered
function checkColorChange(data){
    data.toLowerCase()
    var result = data.match(/\/nickcolor/i);
    if(result === null || result.length!=1)
        return false;
    else
        return true;
}

// return the color of the text
function setColor(data){
    var color = data.split(" ");
    if(color.length > 1)
        return color[1];
    else
        return 0;
}