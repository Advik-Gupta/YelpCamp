const Campground = require('../models/campground');
const mongoose = require('mongoose');
const { places, descriptors } = require('./seedHelpers');
const cities = require('./cities')
// --------------------------------------------------------------

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('MONGO Connection Open')
    })
    .catch(err => {
        console.log('MONGO Connection Failed')
        console.log(err)
    })

// --------------------------------------------------------------

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '614b66aa2c62fa3d488601db',
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae, est. Incidunt quibusdam sit quos suscipit, ipsam cum dolore voluptates debitis obcaecati nulla? Dolores doloribus voluptatum repellendus facilis expedita corporis! Nemo!',
            price,
            geometry: {
                    type: 'Point',
                    coordinates: [ 
                        cities[random1000].longitude ,
                         cities[random1000].latitude 
                     ]
                 },
            images: [
                {
                    url: 'https://res.cloudinary.com/advik-gupta/image/upload/v1632404230/YelpCamp/j7jb88lcxqvre5habtor.jpg',
                    filename: 'YelpCamp/j7jb88lcxqvre5habtor'
                },
                {
                    url: 'https://res.cloudinary.com/advik-gupta/image/upload/v1632404231/YelpCamp/slbk2oxba6arvgslk40a.jpg',
                    filename: 'YelpCamp/slbk2oxba6arvgslk40a'
                }
            ]

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});