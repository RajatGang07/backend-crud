const { validationResult } = require('express-validator');
const User = require('../models/user');

const HttpError = require('../models/httpError');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('No user found', 500);
        return next(error);
    }

    res.json({ users: users.map(user => user.toObject({ getters: true })) })
}


const signUp = async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, Please check your data', 422);
        return next(error);
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Singup failed', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exist already', 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password,
        image: 'https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png',
        places: []

    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Sign up failed, please try again', 500);
        return next(error);
    }
    res.status(201).json({ user: createdUser.toObject({ getters: true }) })
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Logging failed, please try again', 500);
        return next(error);
    }

    if (!existingUser && existingUser.password !== password) {
        const error = new HttpError('Wrong Password', 401);
        return next(error);
    }

    res.json({ message: 'Logged In', user: existingUser.toObject({getters: true}) })
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;