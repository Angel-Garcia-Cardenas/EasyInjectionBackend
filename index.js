require("dotenv").config();
const express = require('express');
const app = express();
const http = require('http');
const socketService = require('./src/services/socket.service');

require('./src/config/database')();
require('./src/config/routes')(app);

const port = process.env.PORT || 3000;
const server = http.createServer(app);

socketService.initialize(server);

server.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;
