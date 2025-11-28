const app = require('./app');
const connectDb = require('../configs/db');

app.setupServer()

// connect to databse
connectDb()

