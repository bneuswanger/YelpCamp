const express = require('express');
const path = require('path'); //Node module that provides utilities for working with file and directory paths. https://nodejs.org/api/path.html#path
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash')
const session = require('express-session')

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); //allows put/patch/delete etc. from HTML; modifieds POST method


const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')


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
app.use(express.static(path.join(__dirname, 'public'))) //this tells Express to use anything in the public folder

const sessionConfig = {
    secret: 'thisshouldbeabettersecret', //this will change at production time
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //security measure, although this seems to be the default now
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => { //make sure this comes before route handlers
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})


app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// Read Route: Display the Homepage
app.get('/', (req, res) => {
    res.render('home')
});


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
