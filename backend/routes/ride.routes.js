const express = require('express');
const router = express.Router();
const {body, query}  = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({min:3}).withMessage('Invalid destination'),
    body('vehicleType').isIn(['auto', 'car','moto']).withMessage('Invalid vehicleType'),

    rideController.createRide

  
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid destination'),
    rideController.getFare
)

router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isString().withMessage('Invalid rideId'),
    rideController.confirmRide
)

router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isString().withMessage('Invalid rideId'),
    query('otp').isString().isLength({min:4, max:4}).withMessage('Invalid OTP'),
     rideController.startRide
)

router.post('/end-ride',
    authMiddleware.authCaptian,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)


module.exports = router;
