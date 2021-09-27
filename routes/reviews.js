const express = require('express');
const router = express.Router({mergeParams : true});
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas.js');
const { validateReview , isLoggedIn , isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews.js')

// ----------------------------Routes----------------------------------

router.post('/' , validateReview, isLoggedIn, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

// ---------------------------------------------------------------------------------------------------------

module.exports = router;
