const Listing = require("../models/listings.js");

module.exports.index = async(req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }}).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
};

module.exports.updateListing = async(req, res) => {
    let {id} = req.params;
    let listing = req.body.listing;
    let newListing = await Listing.findByIdAndUpdate(id, { ...listing });
    
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
        await newListing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings")
};

module.exports.searchListings = async(req, res) => {
    let {q} = req.query;
    
    if (!q || q.trim() === '') {
        req.flash("error", "Please enter a search term!");
        return res.redirect("/listings");
    }
    
    let searchResults = await Listing.find({
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { country: { $regex: q, $options: 'i' } }
        ]
    });
    
    res.render("listings/search.ejs", { searchResults, searchTerm: q });
};