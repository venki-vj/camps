const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const db_Url=process.env.DB_URL||'mongodb://localhost:27017/camps'
mongoose.connect(db_Url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
   
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author:"60374d266a5a453280cccabf",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude]
          },
            images: [
                {
                  
                  url: 'https://res.cloudinary.com/dz6venkiqj3/image/upload/v1614167186/camps/s3iouqwi3mws2aegqkrk.jpg',
                  filename: 'camps/s3iouqwi3mws2aegqkrk'
                },
                {
                 
                  url: 'https://res.cloudinary.com/dz6venkiqj3/image/upload/v1614155665/camps/wiofd6mlnjbo4dfja4eu.jpg',
                  filename: 'camps/wiofd6mlnjbo4dfja4eu'
                },
               
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})