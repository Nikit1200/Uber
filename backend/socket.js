const { Server } = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const { createCorsOptions } = require('./config/cors');


let io;

function initializeSocket(server) {
    io = new Server(server, {
        cors: createCorsOptions()
    });

    io.on('connection', (socket) => {
        console.log(`socket connected: ${socket.id}`);

        socket.on('join', async (data = {}) => {
            const { userId, userType } = data;

            if (!userId || !userType) {
                return;
            }

            console.log(`User ${userId}  joined  as ${userType}`);

            socket.data.userId = userId;
            socket.data.userType = userType;

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
            }
        });

        socket.on('update-location-captain', async (data = {}) => {
            const { userId, userType, location, latitude, longitude } = data;

            const nextLocation = location || {
                lat: latitude,
                lng: longitude
            };

            const nextLatitude = nextLocation?.lat ?? nextLocation?.ltd;
            const nextLongitude = nextLocation?.lng ?? nextLocation?.lang;

            if (!userId || userType !== 'captain' || nextLatitude == null || nextLongitude == null) {
                return;
            }

            console.log(`User ${userId} updated location to ${nextLatitude}, ${nextLongitude}`);

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: nextLatitude,
                    lng: nextLongitude
                }
            });
        });

        socket.on('disconnect', async () => {
            const { userId, userType } = socket.data;

            if (userId && userType === 'user') {
                await userModel.updateOne(
                    { _id: userId, socketId: socket.id },
                    { $set: { socketId: null } }
                );
            } else if (userId && userType === 'captain') {
                await captainModel.updateOne(
                    { _id: userId, socketId: socket.id },
                    { $set: { socketId: null } }
                );
            }

            console.log(`socket disconnected: ${socket.id}`);
        });
    });

    return io;
}

function sendMessageToSocketId(socketId, eventOrMessage, maybeMessage) {
    if (!io) {
        throw new Error('Socket.io has not been initialized. Call initializeSocket(server) first.');
    }

    if (!socketId) {
        return false;
    }

    const eventName = typeof maybeMessage === 'undefined' ? 'message' : eventOrMessage;
    const payload = typeof maybeMessage === 'undefined' ? eventOrMessage : maybeMessage;

    io.to(socketId).emit(eventName, payload);
    return true;
}

module.exports = {
    initializeSocket,
    sendMessageToSocketId
};
