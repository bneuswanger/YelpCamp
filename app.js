const express = require('express');
const path = require('path'); //Node module that provides utilities for working with file and directory paths. https://nodejs.org/api/path.html#path
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

const methodOverride = require('method-override'); //allows put/patch/delete etc. from HTML; modifieds POST method

mongoose.connect('mongodb://localhost:27017/yelp-camp');  //Colt had 3 options set to true here (useNewUrlParser, useCreateIndex and useUnifiedTopology) but they are no longer necessary with the current version of Express

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs'); //tells Express to use ejs as the view engine
app.set('views', path.join(__dirname, 'views')); //tells Express to use the /views folder in the project directory

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Server-side form validation for campground entry
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Server-side form validation for review entry
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Read Route: Display the Homepage
app.get('/', (req, res) => {
    res.render('home')
});

// Read Route: Display the Campgrounds Index
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}));

// Read Route: Display the New Campground Form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// Create Route: Create a New Campground
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    //req.body stores for submission data, which looks like: {"campground":{"title":"asdf","location":"asdf"}}
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Read Route: Display Individual Campground Details
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

// Read Route: Display Edit a Campground Form
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

// Update Route: Edit a Campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params; //req.params just contains the id we want to edit {"id":"621a6d9439effb8a7b5ef34b"}
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Create Route: Add a review to a campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete Route: Delete a Campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// Delete Route: Delete Reviews associated with a deleted campground (requires middleware specified in campground.js)
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

// Error Route: Catch-all for any routes not defined
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// Error Route: Catch-all for any error; Displays Error page
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error.ejs', { err }) //.ejs is not necessary, but I like to include it for clarity
})

// Tells Express which port to listen on
app.listen(3000, () => {
    console.log('Server live on port: 3000')
});
