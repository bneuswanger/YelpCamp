const express = require('express')
const router = express.Router({ mergeParams: true }); //Had to add mergeParams: true after we split the review routes into their own separate router.  This is because express likes to keep params separate, and we didn't have access to the campground ID.

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');


const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

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


// Create Route: Add a review to a campground
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}));


// Delete Route: Delete Reviews associated with a deleted campground (requires middleware specified in campground.js)
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review.')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
