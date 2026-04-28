const rideModel= require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');

async function getFare(pickup, destination){
   
    if(!pickup || !destination){
        throw new Error('Pickup  and destination are required ');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    const distanceInKm = distanceTime.distance.value / 1000;
    const durationInMinutes = distanceTime.duration.value / 60;

    const baseFare = {
        auto: 10,
        car: 20,
        moto: 5
    };

    const perKm = {
        auto: 5,
        car: 10,
        moto: 3
    };

    const perMinute = {
        auto: 1,
        car: 2,
        moto: 0.5
    };

    const fare = {
        auto: Math.round(baseFare.auto + (distanceInKm * perKm.auto) + (durationInMinutes * perMinute.auto)),
        car: Math.round(baseFare.car + (distanceInKm * perKm.car) + (durationInMinutes * perMinute.car)),
        moto: Math.round(baseFare.moto + (distanceInKm * perKm.moto) + (durationInMinutes * perMinute.moto))
    };

    return fare;
}

module.exports.getFare = getFare;

function getOtp(num){
    const otp = crypto.randomInt(0, Math.pow(10, num)).toString().padStart(num, '0');
    return otp;
}


module.exports.createRide=async({
    user, pickup, destination, vehicleType
})=>{
    if(!user || !pickup || !destination || !vehicleType){
        throw new Error('All fields are required');
    }
    const fare = await getFare(pickup, destination);

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(4),
        status: 'pending',
        fare: fare[vehicleType]
    });

    return ride;
}

module.exports.confirmRide = async({
    rideId, captain
})=>{
    if(!rideId){
        throw new Error('rideId is required');
    }

    const updatedRide = await rideModel.findByIdAndUpdate(
        rideId,
        {
            status: 'accepted',
            captain: captain._id
        },
        { new: true }
    );

    if(!updatedRide){
        throw new Error('Ride not found');
    }

    const populatedRide = await rideModel.findById(rideId)
        .populate('user', 'fullname email socketId')
        .populate('captain', 'fullname email vehicle').select('+otp');

    if(!populatedRide){
        throw new Error('Ride not found');
    }

    return populatedRide;
}

module.exports.startRide = async({rideId, otp,captain})=>{
    if(!rideId || !otp){
        throw new Error('rideId and otp are required');
    }
    const ride  = await rideModel.findOne({
        _id:rideId
    }).populate('user').populate('captain').select('+otp');
    if(!ride){
        throw new Error('Ride not found');
    }
    if(ride.status!=='accepted'){
        throw new Error('Ride not accepted yet');
    }
    if(ride.otp!==otp){
        throw new Error('Invalid OTP');
    }
    const updatedRide = await rideModel.findOneAndUpdate({
        _id:rideId
    }, {
        status: 'ongoing'
    }, { new: true }).populate('user').populate('captain').select('+otp');

    return updatedRide;
}

module.exports.endRide = async({rideId, captain})=>{
    if(!rideId){
        throw new Error('rideId is required');

    }
    const ride = await rideModel.findOne({
        _id:rideId,
        captain:captain._id
    }).populate('user').populate('captain').select('+otp');

    if(!ride){
        throw new Error('Ride not found');
    }
    if(ride.status!=='ongoing'){
        throw new Error('Ride not started yet');
    }
    await rideModel.findOneAndUpdate({
        _id:rideId
    }, {
        status: 'completed'
    })
    return ride;
}