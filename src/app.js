const express = require('express');
const app = express();
const routes = require('./routes');
const userRoutes = require('./routes/user.routes');
const companyRoutes = require('./routes/company.routes');
const carRoutes = require('./routes/car.routes');
const bookingRoutes = require('./routes/booking.routes');
const uploadRoutes = require('./routes/uploading.routes')

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const adminAuthRoutes = require('./routes/admins.routes');

app.use(express.json()); // JSON parsing

app.use('/api/cars', carRoutes);
app.use('/', routes); // Use routes
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admins', adminAuthRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


module.exports = app;
