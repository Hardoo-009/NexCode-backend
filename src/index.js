const express = require('express');
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const redisClient = require('./config/redis');
require('dotenv').config({
  path: './.env',
});
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const app = express();
app.use(express.json());
app.use(cookieParser());

// authRouter routes
app.use('/user', authRouter);
// problemRouter route
app.use('/problem', problemRouter);
// submission router
app.use('/submission', submitRouter);

async function InitializeConnection() {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log('Connected to DB');
    app.listen(process.env.PORT, () => {
      console.log(`The server is running at the port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log('Error : ' + error);
    console.error(error);
  }
}

InitializeConnection();
