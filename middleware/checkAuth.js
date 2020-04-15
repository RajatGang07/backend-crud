const HttpError = require('../models/httpError');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization :'BEARER TOKEN'
        if (!token) {
            throw new HttpError('Authentication fails_', 401);
        }
        const decodedToken = jwt.verify(token, 'supersecret_dont_share');
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        const error = new HttpError('Authentication fails', 401);
        return next(error);
    }


}