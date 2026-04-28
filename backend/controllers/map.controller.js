const mapService = require('../services/maps.service');
const {validationResult}=require('express-validator');
module.exports.getCoordinates = async (req, res) => {
	const { address } = req.query;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

	try {
		const coordinates = await mapService.getAddressCoordinate(address);
		res.status(200).json(coordinates);
	} catch (error) {
		res.status(error.statusCode || 500).json({ message: error.message });
	}
};

module.exports.getDistanceTime= async(req,res,next)=>{

try{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const{origin, destination}= req.query;
    const distanceTime = await mapService.getDistanceTime(origin, destination);

    res.status(200).json(distanceTime);

}catch (err){
    res.status(err.statusCode || 500).json({message: err.message});
}


}

module.exports.getAutoCompleteSuggestions= async(req,res,next)=>{
    try{
        const errors= validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const {input} = req.query;
        const suggestions = await mapService.getAutoCompleteSuggestions(input);
        res.status(200).json(suggestions);
    }catch(err){
        res.status(err.statusCode || 500).json({message: err.message})
    }
}
