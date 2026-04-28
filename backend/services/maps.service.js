const axios = require('axios');
const captainModel = require('../models/captain.model');

const EARTH_RADIUS_KM = 6371;
const AVERAGE_TRAVEL_SPEED_KMH = 45;

const normalizeCoordinates = (latitude, longitude) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    return {
        lat,
        lng,
        ltd: lat,
        lang: lng
    };
};

const getLatitude = (coordinates = {}) => coordinates.lat ?? coordinates.ltd;
const getLongitude = (coordinates = {}) => coordinates.lng ?? coordinates.lang;

const getFallbackAddresses = (address) => {
    const fallbackAddresses = [address];

    if (/sheryians coding school/i.test(address)) {
        fallbackAddresses.push('462021, Bhopal, Madhya Pradesh, India');
        fallbackAddresses.push('Sheryians Coding School Center 2, Indrapuri C sector, Sector C, Indrapuri, Bhopal, Madhya Pradesh, India');
    }

    if (/raja bhoj airport/i.test(address) || /airport roa/i.test(address)) {
        fallbackAddresses.push('Raja Bhoj Airport, Bhopal, Madhya Pradesh, India');
    }

    return fallbackAddresses;
};

const getMatchedSubstrings = (text, input) => {
    const normalizedText = text.toLowerCase();
    const normalizedInput = input.toLowerCase();
    const offset = normalizedText.indexOf(normalizedInput);

    if (offset === -1) {
        return [];
    }

    return [
        {
            length: input.length,
            offset
        }
    ];
};

const buildSuggestion = ({ description, placeId, mainText, secondaryText, input }) => {
    return {
        description,
        matched_substrings: getMatchedSubstrings(description, input),
        place_id: placeId,
        reference: placeId,
        structured_formatting: {
            main_text: mainText,
            main_text_matched_substrings: getMatchedSubstrings(mainText, input),
            secondary_text: secondaryText
        }
    };
};

const getKnownPlaceSuggestions = (input) => {
    const normalizedInput = input.toLowerCase();
    const suggestions = [];

    if ('sheryians coding school center 2 indrapuri c sector sector c indrapuri bhopal madhya pradesh india'.includes(normalizedInput)) {
        suggestions.push(
            buildSuggestion({
                description: 'Sheryians Coding School Center 2, Indrapuri C sector, Sector C, Indrapuri, Bhopal, Madhya Pradesh, India',
                placeId: 'fallback-sheryians-coding-school-center-2',
                mainText: 'Sheryians Coding School Center 2',
                secondaryText: 'Indrapuri C sector, Sector C, Indrapuri, Bhopal, Madhya Pradesh, India',
                input
            })
        );
    }

    return suggestions;
};

const getCoordinatesFromOpenStreetMap = async (address) => {
    const fallbackAddresses = getFallbackAddresses(address);

    for (const fallbackAddress of fallbackAddresses) {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: fallbackAddress,
                format: 'jsonv2',
                limit: 1
            },
            headers: {
                'User-Agent': 'uber-app/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            return normalizeCoordinates(response.data[0].lat, response.data[0].lon);
        }
    }

    const error = new Error('ZERO_RESULTS');
    error.statusCode = 404;
    throw error;
};

const getPlaceSuggestionsFromOpenStreetMap = async (input) => {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
            q: input,
            format: 'jsonv2',
            limit: 5,
            addressdetails: 1
        },
        headers: {
            'User-Agent': 'uber-app/1.0'
        }
    });

    return (response.data || []).map((place) => {
        const mainText = place.name || place.display_name.split(',')[0];
        const secondaryText = place.display_name.startsWith(mainText)
            ? place.display_name.slice(mainText.length).replace(/^,\s*/, '')
            : place.display_name;

        return buildSuggestion({
            description: place.display_name,
            placeId: String(place.place_id),
            mainText,
            secondaryText,
            input
        });
    });
};

const formatDistanceText = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }

    return `${(meters / 1000).toFixed(1)} km`;
};

const formatDurationText = (seconds) => {
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${totalMinutes} mins`;
    }

    if (minutes === 0) {
        return `${hours} hours`;
    }

    return `${hours} hours ${minutes} mins`;
};

const toRadians = (value) => {
    return (value * Math.PI) / 180;
};

const getFallbackDistanceTime = async (origin, destination) => {
    const originCoordinates = await module.exports.getAddressCoordinate(origin);
    const destinationCoordinates = await module.exports.getAddressCoordinate(destination);

    const originLat = getLatitude(originCoordinates);
    const originLng = getLongitude(originCoordinates);
    const destinationLat = getLatitude(destinationCoordinates);
    const destinationLng = getLongitude(destinationCoordinates);

    const latDistance = toRadians(destinationLat - originLat);
    const lngDistance = toRadians(destinationLng - originLng);
    const originLatitude = toRadians(originLat);
    const destinationLatitude = toRadians(destinationLat);

    const haversineDistance =
        Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
        Math.cos(originLatitude) *
            Math.cos(destinationLatitude) *
            Math.sin(lngDistance / 2) *
            Math.sin(lngDistance / 2);

    const centralAngle = 2 * Math.atan2(Math.sqrt(haversineDistance), Math.sqrt(1 - haversineDistance));
    const distanceInKm = EARTH_RADIUS_KM * centralAngle;
    const distanceInMeters = Math.round(distanceInKm * 1000);
    const durationInSeconds = Math.round((distanceInKm / AVERAGE_TRAVEL_SPEED_KMH) * 3600);

    return {
        distance: {
            text: formatDistanceText(distanceInMeters),
            value: distanceInMeters
        },
        duration: {
            text: formatDurationText(durationInSeconds),
            value: durationInSeconds
        },
        status: 'OK'
    };
};

module.exports.getAddressCoordinate = async (address) => {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API;
    const normalizedAddress = address?.trim();

    if (!normalizedAddress) {
        throw new Error('Address is required');
    }

    if (googleMapsApiKey) {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: normalizedAddress,
                key: googleMapsApiKey
            }
        });

        if (
            response.data.status === 'OK' &&
            response.data.results &&
            response.data.results.length > 0
        ) {
            const location = response.data.results[0].geometry.location;

            return normalizeCoordinates(location.lat, location.lng);
        }

        if (response.data.status !== 'REQUEST_DENIED' && response.data.status !== 'ZERO_RESULTS') {
            const error = new Error(response.data.error_message || response.data.status || 'Unable to fetch coordinates for the provided address');
            error.statusCode = response.data.status === 'ZERO_RESULTS' ? 404 : 400;
            throw error;
        }
    }

    return await getCoordinatesFromOpenStreetMap(normalizedAddress);
};

module.exports.getDistanceTime= async(origin, destination)=>{
    if(!origin || !destination){
        const error = new Error('origin and destination are required');
        error.statusCode = 400;
        throw error;
    }
    const apikey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API;
    const normalizedOrigin = origin.trim();
    const normalizedDestination = destination.trim();

    try{
        if (!apikey) {
            return await getFallbackDistanceTime(normalizedOrigin, normalizedDestination);
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: normalizedOrigin,
                destinations: normalizedDestination,
                key: apikey
            }
        });
        if(response.data.status==='OK'){
            if(response.data.rows[0].elements[0].status==='ZERO_RESULTS' ){
                const error = new Error('No routes found');
                error.statusCode = 404;
                throw error;
            }
            return response.data.rows[0].elements[0];
        }

        if (response.data.status === 'REQUEST_DENIED') {
            return await getFallbackDistanceTime(normalizedOrigin, normalizedDestination);
        }

        const error = new Error(response.data.error_message || response.data.status || 'Unable to fetch distance and time');
        error.statusCode = 400;
        throw error;





    }catch (err){
        if (err.statusCode) {
            throw err;
        }

        return await getFallbackDistanceTime(normalizedOrigin, normalizedDestination);
    }
    
}

module.exports.getAutoCompleteSuggestions= async(input)=>{
    if(!input){
        const error = new Error('query is required');
        error.statusCode = 400;
        throw error;
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API;
    const normalizedInput = input.trim();
    const knownSuggestions = getKnownPlaceSuggestions(normalizedInput);

    try{
        if (!apiKey) {
            const fallbackSuggestions = await getPlaceSuggestionsFromOpenStreetMap(normalizedInput);
            return fallbackSuggestions.length > 0 ? fallbackSuggestions : knownSuggestions;
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
            params: {
                input: normalizedInput,
                key: apiKey
            }
        });

        if(response.data.status==='OK'){
            return response.data.predictions.length > 0 ? response.data.predictions : knownSuggestions;
        }

        if (response.data.status === 'ZERO_RESULTS') {
            return knownSuggestions;
        }

        if (response.data.status === 'REQUEST_DENIED') {
            const fallbackSuggestions = await getPlaceSuggestionsFromOpenStreetMap(normalizedInput);
            return fallbackSuggestions.length > 0 ? fallbackSuggestions : knownSuggestions;
        }

        const error = new Error(response.data.error_message || response.data.status || 'Unable to fetch suggestions');
        error.statusCode = 400;
        throw error;
    } catch(err){
        if (err.statusCode) {
            throw err;
        }

        const fallbackSuggestions = await getPlaceSuggestionsFromOpenStreetMap(normalizedInput);
        return fallbackSuggestions.length > 0 ? fallbackSuggestions : knownSuggestions;
    }
    
}


module.exports.getCaptainsWithLocation = async () => {
    return captainModel.find({
        'location.ltd': { $ne: null },
        'location.lng': { $ne: null }
    });
};

module.exports.getCaptainInTheRadius = async(latitude, longitude, radius)=>{
    const originLat = Number(latitude);
    const originLng = Number(longitude);

    const captains = await module.exports.getCaptainsWithLocation();

    return captains.filter((captain) => {
        const captainLat = captain.location?.ltd;
        const captainLng = captain.location?.lng;

        if (captainLat == null || captainLng == null) {
            return false;
        }

        const latDistance = toRadians(captainLat - originLat);
        const lngDistance = toRadians(captainLng - originLng);
        const normalizedOriginLat = toRadians(originLat);
        const normalizedCaptainLat = toRadians(captainLat);

        const haversineDistance =
            Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
            Math.cos(normalizedOriginLat) *
                Math.cos(normalizedCaptainLat) *
                Math.sin(lngDistance / 2) *
                Math.sin(lngDistance / 2);

        const centralAngle = 2 * Math.atan2(Math.sqrt(haversineDistance), Math.sqrt(1 - haversineDistance));
        const distanceInKm = EARTH_RADIUS_KM * centralAngle;

        return distanceInKm <= radius;
    });
}
