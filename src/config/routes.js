const express = require('express');
const cors = require('cors');
const register = require('../api/routes/register.routes');
const verifyEmail = require('../api/routes/verify-email.routes');
const login = require('../api/routes/login.routes');
const auth = require('../api/routes/auth.routes');
const user = require('../api/routes/user.routes');
const scans = require('../api/routes/scan.routes');
const error = require('../api/middleware/error.middleware');

module.exports = function(app) {
    app.use(cors());
    app.use(express.json());
    app.use('/api/register', register);
    app.use('/api/verify-email', verifyEmail);
    app.use('/api/login', login);
    app.use('/api/auth', auth);
    app.use('/api/user', user);
    app.use('/api/scans', scans);
    app.use(error);
}

