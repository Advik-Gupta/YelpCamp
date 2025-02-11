const mongoose = require("mongoose");
const Campground = require("../models/campground");

const cities = require("./cities");
const places = require("./seedHelper").places;
const descriptors = require("./seedHelper").descriptors;

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random].city}, ${cities[random].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://picsum.photos/400?random=${Math.random()}",
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempore recusandae, ea sit odio id voluptas mollitia minima dolorem impedit quidem quibusdam eius voluptate iusto officiis maxime quaerat quia doloribus quasi. Assumenda nesciunt fugiat perferendis, accusamus error ipsum temporibus nostrum quisquam distinctio, quasi vel voluptate dicta?",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
