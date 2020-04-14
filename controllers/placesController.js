const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/httpError');
const Place = require('../models/place');
const User = require('../models/user');
const getCoordsForAddress = require('../util/location');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {

        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong DB', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id', 404);
        return next(error);
    }
    res.json({ place: place.toObject({ getters: true }) });
}


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // let places;
    let userWithPlaces
    try {
        // places = await Place.find({ creator: userId });
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again', 500);
        return next(error);
    }
    if (!userWithPlaces || userWithPlaces.length === 0) {
        const error = new HttpError('Could not find a place for the provided user id', 404);
        return next(error);

    }
    res.json({ userWithPlaces: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        console.log(error); // send your own data
        return next(new HttpError('Invalid inputs passed, Please check your data', 422));
    }

    const { title, description, address, creator } = req.body;

    // let coordinates;
    // try {
    //     coordinates = await getCoordsForAddress(address);
    // } catch (error) {
    //     return next(error);
    // }


    const createdPlace = new Place({
        title,
        description,
        address,
        location: {
            lat: 12.8960006,
            lng: 77.6755386
        },
        image: 'https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png',
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdPlace.save({ session: session });
        user.places.push(createdPlace);
        await user.save({ session: session });
        await session.commitTransaction();

    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }

    res.status(201).json({ place: createdPlace });

}

const updatePlace = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error); // send your own data
        throw new HttpError('Invalid inputs passed, Please check your data', 422)
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Updating place failed, please try again', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, Updating place failed', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, Could not find the place with this Id', 404);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find the place with this Id', 404);
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.remove({ session: session });
        place.creator.places.pull(place);
        await place.creator.save({ session: session })
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, Updating place failed', 500);
        return next(error);
    }

    res.status(200).json({ message: 'Deleted Place.' });

}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace
