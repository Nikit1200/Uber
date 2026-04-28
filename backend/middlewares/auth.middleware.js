const blacklistTokenModel = require('../models/blacklistToken.model');
const captainModel = require('../models/captain.model');
const userModel = require('../models/user.model');
const jwt =require('jsonwebtoken');

const extractToken = (req) => {
    const authValue =
        req.headers.authorization ||
        req.headers.autorization ||
        req.query.authorization ||
        req.query.Authorization ||
        req.body?.authorization ||
        req.body?.Authorization ||
        req.body?.Autorization ||
        '';

    return req.cookies?.token || authValue.replace(/^Bearer\s+/i, '').trim();
};

const isBlacklistedToken = async (token) => {
    return await blacklistTokenModel.findOne({ token: token });
};

module.exports.authUser = async(req,res,next)=>{
    const token = extractToken(req);

    if(!token){
        return res.status(401).json({message:'unauthorized'});
    }

    const isBlacklisted = await isBlacklistedToken(token);
    if(isBlacklisted){
        return res.status(401).json({message:'unauthorized'})
    }


    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user= await userModel.findById(decoded._id);

        if(!user){
            return res.status(401).json({message:'unauthorized'});
        }

        req.user = user;

        return next();

    } catch(err){
        return res.status(401).json({message:'unauthorized'});
    }
}

module.exports.authCaptain = async(req,res,next)=>{
    const token = extractToken(req);

    if(!token){
        return res.status(401).json({message:'unauthorized'});
    }
    const isBlacklisted = await isBlacklistedToken(token);

    if(isBlacklisted){
        return res.status(401).json({message:'Unauthorized'});
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);

        if(!captain){
            return res.status(401).json({message:'Unauthorized'});
        }

        req.captain = captain;
        return next();
    }
    catch(err){
        return res.status(401).json({message:'Unauthorized'});
    }
}

// Keep backward compatibility with existing route usage.
module.exports.authCaptian = module.exports.authCaptain

module.exports.authUserOrCaptain = async(req,res,next)=>{
    const token = extractToken(req);

    if(!token){
        return res.status(401).json({message:'unauthorized'});
    }

    const isBlacklisted = await isBlacklistedToken(token);
    if(isBlacklisted){
        return res.status(401).json({message:'unauthorized'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if(user){
            req.user = user;
            return next();
        }

        const captain = await captainModel.findById(decoded._id);

        if(captain){
            req.captain = captain;
            return next();
        }

        return res.status(401).json({message:'unauthorized'});
    } catch(err){
        return res.status(401).json({message:'unauthorized'});
    }
}
