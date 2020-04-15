const { Router } = require('express');
const { check } = require('express-validator');

const placeController = require('../controllers/placesController');
const fileUpload = require('../middleware/fileUpload');
const checkAuth = require('../middleware/checkAuth');

const router = Router();

router.get('/:pid', placeController.getPlaceById);

router.get('/user/:uid', placeController.getPlacesByUserId);

router.use(checkAuth);

router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({min:5}),
        check('address').not().isEmpty()
    ],
    placeController.createPlace
    );


router.patch('/:pid', 
    [
        check('title').not().isEmpty(),
        check('description').isLength({min:5}),
    ]        
, placeController.updatePlace);

router.delete('/:pid', placeController.deletePlace);

module.exports = router;
