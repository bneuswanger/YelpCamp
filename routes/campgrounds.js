const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')


// Read Route: Display the Campgrounds Index
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
})
);

// Read Route: Display the New Campground Form
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// Create Route: Create a New Campground
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    //req.body stores for submission data, which looks like: {"campground":{"title":"asdf","location":"asdf"}}
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
})
);

// Read Route: Display Individual Campground Details
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews").populate('author');
    if (!campground) {
        req.flash("error", "The campground you wanted does not exist - sorry!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
})
);

// Read Route: Display Edit a Campground Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "The campground you wanted does not exist - sorry!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
})
);

// Update Route: Edit a Campground
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params; //req.params just contains the id we want to edit {"id":"621a6d9439effb8a7b5ef34b"}
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground, });
    req.flash("success", "Succesfully updated campground.");
    res.redirect(`/campgrounds/${campground._id}`);
})
);

// Delete Route: Delete a Campground
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
})
);

module.exports = router;
