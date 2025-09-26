const Review = require("../models/review.js");
const Listing = require("../models/listings.js");

module.exports.createReview = async(req, res) => {
    let {id} = req.params;
    let reviewData = req.body.review;
    let listing = await Listing.findById(id);
    let newReview = new Review(reviewData);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};