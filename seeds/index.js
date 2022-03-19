const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp');  //Colt had 3 options set to true here (useNewUrlParser, useCreateIndex and useUnifiedTopology) but they are no longer necessary with the current version of Express

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

/////////////////////////////////////////////////////////////////////////////
// CAUTION: RUNNING THIS FILE WIPES THE DATABASE AND RESEEDS IT WITH NEW DATA
/////////////////////////////////////////////////////////////////////////////

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62349bd3792d6d402f039d9e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae accusantium reiciendis nobis, deserunt voluptatum libero incidunt molestias aspernatur itaque omnis, quam nesciunt optio in quo recusandae voluptatibus placeat nulla exercitationem.',
            price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});