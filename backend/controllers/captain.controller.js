const captainModel = require('../models/captain.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');

module.exports.registerCaptain = async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, vehicle } = req.body;
        const isCaptainAlreadyExist= await captainModel.findOne({email});
        if(isCaptainAlreadyExist){
            return res.status(400).json({message:'Captain already exist'});
        }
        const hashedPassword = await captainModel.hashPassword(password);

        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        const token = captain.generateAuthToken();
        const captainResponse = captain.toObject();
        delete captainResponse.password;

        return res.status(201).json({ token, captain: captainResponse });
    }catch(error){
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Unable to register captain'
        });
    }
}

module.exports.loginCaptain = async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }

        const {email, password} = req.body;
        const captain = await captainModel.findOne({email}).select('+password');

        if(!captain){
            return res.status(401).json({message:'Invalid email or password'});
        }

        const isMatch = await captain.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message:'Invalid email or password'});
        }

        const token = captain.generateAuthToken();
        res.cookie('token',token);
        const captainResponse = captain.toObject();
        delete captainResponse.password;

        return res.status(200).json({token,captain:captainResponse});
    }catch(error){
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Unable to login captain'
        });
    }
}

module.exports.getCaptainProfile = async(req,res,next)=>{
    return res.status(200).json({captain:req.captain});
}

module.exports.logoutCaptain= async(req, res, next)=>{
    const authValue = req.headers.authorization || '';
    const token = req.cookies?.token || authValue.replace(/^Bearer\s+/i, '').trim();

    if(token){
        await blacklistTokenModel.create({token});
    }
    res.clearCookie('token');
    return res.status(200).json({message:'Logout successfully'})
}
