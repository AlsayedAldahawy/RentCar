const express = require('express');
const app = express();
const routes = require('./routes');
const userRoutes = require('./routes/user.routes');
const companyRoutes = require('./routes/company.routes');

app.use(express.json()); // JSON parsing

app.use('/', routes); // Use routes
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);

module.exports = app;
