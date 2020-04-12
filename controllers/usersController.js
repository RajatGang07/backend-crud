const HttpError = require('../models/httpError');
const { validationResult } = require('express-validator');

const uuid = require('uuid/v4');

const DUMMY_USERS = [{ id: "u1", name: "Rajat", email: "r@gmail.com", password: 'tester' }];

const getUsers = (req, res, next) => {

    res.json({ users: DUMMY_USERS });
}


const signUp = (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        console.log(error); // send your own data
        throw new HttpError('Invalid inputs passed, Please check your data', 422)
    }

    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email);
    if (hasUser) {
        throw new Error('Cannot create user, User Already Exist', 422);
    }
    const createdUser = {
        id: uuid(),
        name,
        email,
        password
    }
    DUMMY_USERS.push(createdUser);
    res.status(201).json({ user: createdUser })
};

const login = (req, res, next) => {
    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    if (!identifiedUser || identifiedUser.password === password) {
        throw new HttpError('No user found', 401);
    }
    res.json({ message: 'Logged In' })
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;