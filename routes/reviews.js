const express = require('express')
const router = express.Router({ mergeParams: true }); //Had to add mergeParams: true after we split the review routes into their own separate router.  This is because express likes to keep params separate, and we didn't have access to the campground ID.
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews')
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')



// Create Route: Add a review to a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete Route: Delete Reviews associated with a deleted campground (requires middleware specified in campground.js)
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;
