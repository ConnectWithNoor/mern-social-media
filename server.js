const express = require('express');
const next = require('next');

require('dotenv').config({ path: './config.env' });

const connectDB = require('./utilsServer/connectDb');
const {
  addUser,
  removeUser,
  findConnectedUser,
} = require('./utilsServer/roomActions');
const {
  loadMessages,
  sendMsg,
  setMsgToUnread,
  deleteMsg,
} = require('./utilsServer/messsageActions');

const likeOrUnlikePost = require('./utilsServer/likesOrUnlikePost');

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

app.use(express.json());

connectDB();
io.on('connection', (socket) => {
  // join event

  socket.on('join', async ({ userId }) => {
    const users = await addUser(userId, socket.id);

    setInterval(() => {
      socket.emit('connectedUsers', {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });

  socket.on('likePost', async ({ postId, userId, like }) => {
    const { success, name, profilePicUrl, username, postByUserId, error } =
      await likeOrUnlikePost(postId, userId, like);

    if (success) {
      socket.emit('postLiked');

      if (postByUserId !== userId) {
        const receiverSocket = findConnectedUser(postByUserId);

        if (receiverSocket && like) {
          io.to(receiverSocket.socketId).emit('newNofiticationReceived', {
            name,
            profilePicUrl,
            username,
            postId,
          });
        }
      }
    }
  });

  socket.on('loadMessages', async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);

    if (!error) socket.emit('messagesLoaded', { chat });
    else socket.emit('noChatFound');
  });

  socket.on('sendNewMsg', async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);
    const receiverSocket = await findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
    } else {
      await setMsgToUnread(msgSendToUserId);
    }

    if (!error) {
      socket.emit('msgSent', { newMsg });
    }
  });

  socket.on('deleteMsg', async ({ userId, messagesWith, messageId }) => {
    const { success } = await deleteMsg(userId, messagesWith, messageId);

    if (success) {
      socket.emit('msgDeleted');
    }
  });

  socket.on(
    'sendMsgFromNotification',
    async ({ userId, msgSendToUserId, msg }) => {
      const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);
      const receiverSocket = await findConnectedUser(msgSendToUserId);

      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
      } else {
        await setMsgToUnread(msgSendToUserId);
      }
      if (!error) {
        socket.emit('msgSentFromNotification');
      }
    }
  );

  // disconnect event
  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log('User disconnected successfully');
  });
});

nextApp.prepare().then(() => {
  app.use('/api/signup', require('./api/signup'));
  app.use('/api/auth', require('./api/auth'));
  app.use('/api/search', require('./api/search'));
  app.use('/api/post', require('./api/post'));
  app.use('/api/profile', require('./api/profile'));
  app.use('/api/notifications', require('./api/notifications'));
  app.use('/api/chats', require('./api/chats'));
  app.use('/api/reset', require('./api/reset'));

  app.all('*', (req, res) => handle(req, res));

  server.listen(PORT, (err) => {
    if (err) throw err;

    console.log(`Server Running at ${PORT}`);
  });
});
