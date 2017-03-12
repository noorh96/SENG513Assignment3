$(function () {
    var socket = io.connect();
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $users = $('#users');
    var user;

    // Print messages on first connection
    socket.on('first connect', function (data) {
        //for(i = 0; i < data.length; i++){
        //  $chat.append('<div class = "well"><strong>'+data[i].time[0]+':'+ data[i].time[1]+' '+data[i].username+': </strong> '+data[i].msg+'</div>');
        //}
    });

    //Submit message to server
    $messageForm.submit(function (e) {
        e.preventDefault();
        socket.emit('send message', $message.val());
        $message.val(''); //Clear message field
    });

    // get current user
    socket.on('get user', function (data) {
        user = data; // set user to the value of socket.username
    });

    //Print message from server
    socket.on('new message',function (data) {
        var colorVal = data.color; // get color from the data object
        document.getElementById("chat").style.color = "#"+colorVal; // Change the color of the text

        if(user === data.username)
            document.getElementById("chat").style.fontWeight = 700; // If the user is the current user, make their messages bold

        $chat.append('<div class = "well"><strong>'+data.time[0]+':'+ data.time[1]+' '+data.username+': </strong> '+data.msg+'</div>');
        $('#chat').scrollTop($('#chat').scrollTop() + $('#chat').height());
    });

    //Print list of users
    socket.on('get users',function (data) {
        var html = '';
        for(i = 0; i < data.users.length; i++){
            if(data.users[i] === user) {
                html += '<li class = "list-group-item" style="font-weight: bold"> ' + data.users[i] + ' (You)</li>' // If the current user is iterated over, indicate that it's them
            }
            else
                html+= '<li class = "list-group-item"> '+data.users[i]+'</li>';
        }
        $users.html(html); // Print out the list of users
    })


});/**
 * Created by Noor on 2017-03-12.
 */
