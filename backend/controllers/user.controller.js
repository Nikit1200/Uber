const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const {validationResult} = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');





module.exports.registerUser= async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({error:errors.array()});
        }
        console.log(req.body);
        const{fullname,email,password}=req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const isUserAlready = await userModel.findOne({email: normalizedEmail});
        if(isUserAlready){
            return res.status(400).json({message:'User already exist'});
        }
        const hashedPassword = await userModel.hashPassword(password);

        const user= await userService.createUser({
            firstname:fullname.firstname,
            lastname:fullname.lastname,
            email: normalizedEmail,
            password:hashedPassword
        });

        const token = user.generateAuthToken();
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({token,user:userResponse});
    }catch(error){
        if(error.code === 11000 || error.statusCode === 409){
            return res.status(409).json({message:'User already exists with this email'});
        }

        return res.status(error.statusCode || 500).json({
            message: error.message || 'Unable to register user'
        });
    }
}

module.exports.loginUser= async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const {email,password} = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const user= await userModel.findOne({email: normalizedEmail}).select('+password');

        if(!user){
            return res.status(401).json({message:'Invalid email or password'});
        }
        const isMatch = await user.comparePassword(password);

        if(!isMatch){
            return res.status(401).json({message:'Invalid email or password'});
        }
        const token = user.generateAuthToken();
        res.cookie('token',token);
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({token,user:userResponse});
    }catch(error){
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Unable to login user'
        });
    }
}

module.exports.getUserProfile = async(req,res,next)=>{
    return res.status(200).json({user:req.user});
}

module.exports.logoutUser= async(req,res,next)=>{
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    await blacklistTokenModel.create({token})
    res.status(200).json({message:'Logged out'})
}
