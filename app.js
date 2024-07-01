const express = require('express');
const bodyParser = require('body-parser');

const dbSetup = require('./config/db-setup');
const apiRoutes = require('./routes/api');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/api', apiRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

dbSetup()
  .then(() => {
    app.listen(8080);
    console.log("app start port 8080");
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
