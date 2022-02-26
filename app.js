const express = require('express');
const path = require('path'); //Node module that provides utilities for working with file and directory paths. https://nodejs.org/api/path.html#path
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/yelp-camp');  //Colt had 3 options set to true here (useNewUrlParser, useCreateIndex and useUnifiedTopology) but they are no longer necessary with the current version of Express

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.set('view engine', 'ejs'); //tells Express to use ejs as the view engine
app.set('views', path.join(__dirname, 'views')); //tells Express to use the /views folder in the project directory

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
});

// Campgrounds Index Route
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
    //req.body stores for submission data, which looks like: {"campground":{"title":"asdf","location":"asdf"}}
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

// Campgrounds Show Route (eventually details page for each campsite)
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params; //req.params just contains the id we want to edit {"id":"621a6d9439effb8a7b5ef34b"}
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


app.listen(3000, () => {
    console.log('serving on port 3000')
});