const mongoose = require('mongoose');
const userModel = require('../models/user.model');

async function syncUserIndexes() {
    try {
        const collections = await mongoose.connection.db
            .listCollections({ name: userModel.collection.name })
            .toArray();

        if (collections.length) {
            const indexes = await userModel.collection.indexes();
            const hasLegacyEmailIndex = indexes.some((index) => index.name === 'fullname.email_1');

            if (hasLegacyEmailIndex) {
                await userModel.collection.dropIndex('fullname.email_1');
                console.log('Dropped stale index: fullname.email_1');
            }
        }

        await userModel.syncIndexes();
        console.log('User indexes synced');
    } catch (err) {
        console.log('Failed to sync user indexes:', err.message);
    }
}

function connectToDb(){
    mongoose.connect(process.env.DB_CONNECT)
    .then(async ()=>{
        console.log('connected to DB');
        await syncUserIndexes();
    }).catch(err=> console.log(err));
}

module.exports= connectToDb;
