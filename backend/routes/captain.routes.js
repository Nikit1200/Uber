const express = require('express');
const router = express.Router();
const {body}= require("express-validator")
const captainController = require('../controllers/captain.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register',[
body('email').isEmail().withMessage('Invalid email'),
body('fullname.firstname').isLength({min:3}).withMessage('Firstname must be at least 3 characters'),
body('password').isLength({min:6}).withMessage('Password must be at least 6 characters'),
body('vehicle').isObject().withMessage('Vehicle details required'),
body('vehicle.color').isLength({min:3}).withMessage('Vehicle color required'),
body('vehicle.plate').isLength({min:3}).withMessage('Vehicle plate required'),
body('vehicle.capacity').isInt({min:1}).withMessage('Vehicle capacity required'),
body('vehicle.vehicleType').isIn(['auto','car','motorcycle']).withMessage('Invalid vehicle type'),
], 
captainController.registerCaptain
)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters')
],
    captainController.loginCaptain
)

router.get('/profile',authMiddleware.authCaptain,captainController.getCaptainProfile)


router.get('/logout',authMiddleware.authCaptain, captainController.logoutCaptain)

module.exports = router;
