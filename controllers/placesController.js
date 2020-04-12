const HttpError = require('../models/httpError');
const { validationResult } = require('express-validator');

const getCoordsForAddress = require('../util/location');

const uuid = require('uuid/v4');

let DUMMY_PLACES = [{
    id: 'p1',
    title: 'Klassik Landmark',
    description: 'One of the most famous scrappers in the world',
    address: 'Cosmos 13A Klassik Landmark Sarjapur Road',
    location: {
        lat: 12.8960006,
        lng: 77.6755386
    },
    creator: 'u1'
},
{
    id: 'p2',
    title: 'Klassik Landmark',
    description: 'One of the most famous scrappers in the world',
    address: 'Cosmos 13A Klassik Landmark Sarjapur Road',
    location: {
        lat: 12.8960006,
        lng: 77.6755386
    },
    creator: 'u2'
}];

const getPlaceById = (req, res, next) => {
    console.log('Get request in places');
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => { return p.id === placeId })
    if (!place) {
        throw new HttpError('Could not find a place for the provided id', 404);
    }
    res.json({ place });
}


const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const places = DUMMY_PLACES.filter(u => { return u.creator === userId });
    if (!places || places.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id', 404));

    }
    res.json({ places });
};

const createPlace = async (res, req, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        console.log(error); // send your own data
       return next(new HttpError('Invalid inputs passed, Please check your data', 422));
    }
    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator,

    };
    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace });

}

const updatePlace = (res, req, next) => {
    if (!error.isEmpty()) {
        console.log(error); // send your own data
        throw new HttpError('Invalid inputs passed, Please check your data', 422)
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };

    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;


    res.status(200).json({ place: updatedPlace });
}

const deletePlace = (res, req, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find the place with this Id', 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

    res.status(200).json({ message: 'Deleted Place.' });

}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace
