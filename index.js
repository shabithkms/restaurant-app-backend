const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const db = require('./config/connection');

// Routes
const adminRouter=require('./routes/admin')

const PORT = 3001;
app.listen(PORT, () => {
  console.log('server running on ' + PORT);
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Api service route
app.get('/api', (req, res) => {
  res.send('Welcome to API Service');
});

// Db connection
db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Database connected');
  }
});

app.use('/api/admin',adminRouter)


