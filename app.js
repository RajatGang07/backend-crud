const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/placesRoutes');
const userRoutes = require('./routes/userRoutes');
const HttpError = require('./models/httpError');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);

app.use('/api/users', userRoutes);

app.use((req,res,next) => {
    const error = new HttpError('Could not find the route', 404);
    throw error;
});

app.use((error, req, res, nex) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unkown error occured'});
})


app.listen(5000);