const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// Verifies that a user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER-->", req.user)
    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl) we want the originalUrl here
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first.');
        return res.redirect('/login')
    }
    next();
}

// Server-side form validation for campground entry
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// When trying to edit or delete a campground, this authorizes ONLY the campground author to do so.
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// Server-side form validation for review entry
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
