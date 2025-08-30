const express = require('express');
const app = express();
const routes = require('./routes');
const userRoutes = require('./routes/user.routes');
const companyRoutes = require('./routes/company.routes');
const carRoutes = require('./routes/car.routes');
const bookingRoutes = require('./routes/booking.routes');
const uploadRoutes = require('./routes/uploading.routes')
const verifyRoutes = require('./routes/verify.routes');
const resetRoutes = require('./routes/reset.routes')
const transmissionRoutes = require('./routes/transmission.routes')
const fuelRoutes = require('./routes/fuel.routes')

const cors = require("cors");

app.use(cors());

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const adminAuthRoutes = require('./routes/admins.routes');
const citiesRoute = require('./routes/cities.routes')
const regionsRoute = require('./routes/regions.routes')

app.use(express.json()); // JSON parsing

app.use('/api/cars', carRoutes);
app.use('/', routes); // Use routes
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admins', adminAuthRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/verify', verifyRoutes);
app.use('/api/reset', resetRoutes);

app.use('/api/transmission', transmissionRoutes);
app.use('/api/fuel', fuelRoutes);

app.use('/api/cities', citiesRoute);
app.use('/api/regions', regionsRoute);




app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


module.exports = app;
