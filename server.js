const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static fol der
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat-ON-Line';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to World of Chat-ON-Line!!!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const path = require('path');
// const express = require('express');
// const http = require('http');
// const socketio = require('socket.io')


// const app = express();
// const server=http.createServer(app);
// const io = socketio(server)

// app.use(express.static(path.join(__dirname,'public')))

// io.on('connection',socket =>{

//     socket.on('joinRoom',({username,room})=>{
//             // console.log("new connection")

//     socket.emit('message','welcome th onlineCHAT')

//     socket.broadcast.emit('message','user has joined');
//     })

//     socket.on('chatMessage',(msg)=>{
//         io.emit('message',msg)
//    })

//    socket.on('disconnect',()=>{
//     io.emit('message','a user left the chat')
// });

// })

// const PORT = 3000|| process.env.PORT;

// server.listen(PORT,()=>console.log(`server is running on port ${PORT}`))




/////////NODEMON SERVER