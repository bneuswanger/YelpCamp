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
    for (let i = 0; i < 900; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //MY user ID is used as the seed
            author: '62349bd3792d6d402f039d9e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dktwpnsqc/image/upload/c_fill,w_800,h_600,g_auto/v1647882222/YelpCamp/n4bqvcvbzlifvdnz3ssp.jpg',
                    filename: 'YelpCamp/n4bqvcvbzlifvdnz3ssp',
                },
                {
                    url: 'https://res.cloudinary.com/dktwpnsqc/image/upload/c_fill,w_800,h_600,g_auto/v1647882256/YelpCamp/tnw0jp15adgevjr5jwgr.jpg',
                    filename: 'YelpCamp/tnw0jp15adgevjr5jwgr',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae accusantium reiciendis nobis, deserunt voluptatum libero incidunt molestias aspernatur itaque omnis, quam nesciunt optio in quo recusandae voluptatibus placeat nulla exercitationem.',
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});