const express = require('express');
const next = require('next');
require('dotenv').config({ path: './config.env' });

const connectDB = require('./utilsServer/connectDb');

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

const app = express();
const server = require('http').Server(app);

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

app.use(express.json());

connectDB();

nextApp.prepare().then(() => {
  app.use('/api/signup', require('./api/signup'));
  app.use('/api/auth', require('./api/auth'));
  app.use('/api/search', require('./api/search'));
  app.use('/api/post', require('./api/post'));
  app.use('/api/profile', require('./api/profile'));
  app.use('/api/notifications', require('./api/notifications'));
  app.use('/api/chats', require('./api/chats'));

  app.all('*', (req, res) => handle(req, res));

  server.listen(PORT, (err) => {
    if (err) throw err;

    console.log(`Server Running at ${PORT}`);
  });
});
