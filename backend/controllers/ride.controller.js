const rideService = require('../services/ride.service');
const {validationResult}= require('express-validator');
const mapService = require('../services/maps.service');
const rideModel = require('../models/ride.model');
const {sendMessageToSocketId} = require('../socket');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });

        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        let captainsInRadius = await mapService.getCaptainInTheRadius(
            pickupCoordinates.ltd ?? pickupCoordinates.lat,
            pickupCoordinates.lng ?? pickupCoordinates.lang,
            2
        );

        ride.otp = "";
        const rideWithUser = await rideModel.findById(ride._id)
            .populate('user', 'fullname email _id')
            .select('+otp');

        const payload = {
            _id: rideWithUser._id,
            user: rideWithUser.user,
            pickup: rideWithUser.pickup,
            destination: rideWithUser.destination,
            fare: rideWithUser.fare,
            status: rideWithUser.status,
            otp: rideWithUser.otp
        };

        if (captainsInRadius.length === 0) {
            const captainsWithLocation = await mapService.getCaptainsWithLocation();
            console.log(`No nearby captains found, falling back to ${captainsWithLocation.length} captains with location.`);
            captainsInRadius = captainsWithLocation;
        }

        console.log(`Sending new-ride to ${captainsInRadius.length} captain(s).`);

        captainsInRadius.forEach((captain) => {
            if (!captain.socketId) {
                return;
            }

            sendMessageToSocketId(captain.socketId, 'new-ride', payload);
        });

        return res.status(201).json(rideWithUser || ride);
    } catch (err) {
        console.error(err);
        return res.status(err.statusCode || 500).json({ message: err.message });
    }
};

module.exports.getFare = async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const  {pickup, destination} = req.query;
    try{
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err){
        return res.status(err.statusCode || 500).json({message:err.message});
    }
}

module.exports.confirmRide = async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {rideId} = req.body;
    try{
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });
        sendMessageToSocketId(ride.user.socketId, 'ride-confirmed', ride)
        return res.status(200).json(ride)
    } catch (err) {
        console.error('Confirm ride error:', err);
        return res.status(err.statusCode || 500).json({message:err.message});
    }
}

module.exports.startRide = async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {rideId, otp} = req.query;
    try{
        const ride = await rideService.startRide({
            rideId,otp, captain: req.captain
        });
        sendMessageToSocketId(ride.user.socketId, 'ride-started', ride)
        return res.status(200).json(ride);
    }catch(err){
        return res.status(500).json({message:err.message});
    }
}

module.exports.endRide = async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {rideId} = req.body;
    try{
        const ride = await rideService.endRide({
            rideId, captain :req.captain

        });
        sendMessageToSocketId(ride.user.socketId, 'ride-ended', ride)

        return res.status(200).json(ride);
    }catch(err){
        return res.status(500).json({message:err.message});
    }
}
