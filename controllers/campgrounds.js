const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds.js')
const { cloudinary } = require('../cloudinary/index.js')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


// ----------------------------Controller Functions----------------------------------

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
	if (req.files.length > 5) {
		toDeleteImages = req.files.map(f => ({url: f.path.replace('/upload' , '/upload/w_1920,h_1080,c_fill') , filename: f.filename}))
		for (let image of toDeleteImages) {
			filename = image.filename;
			await cloudinary.uploader.destroy(filename)
		}
        req.flash('error' , 'Cannot upload more than 5 images')
        res.redirect('/campgrounds')
    }
	const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	campground.images = req.files.map(f => ({url: f.path.replace('/upload' , '/upload/w_1920,h_1080,c_fill') , filename: f.filename}));
	campground.author = req.user._id
	await campground.save();
	req.flash('success' , "Successfully made new campground")
	res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
	const campground = await Campground.findById(req.params.id).populate({
		path: 'reviews',
		populate: {
			path: 'author'
		}
	}).populate('author');

	if(!campground) {
		req.flash('error' , 'Cannot find Campground')
		return res.redirect('/campgrounds')
	}
	res.render('campgrounds/show', { campground })
}


module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    if (!campground.author.equals(req.user._id)) {
		req.flash('error' , 'Only campground owner is allowed to edit campground.')
		res.redirect(`/campgrounds/${id}`)
	}
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
	const {id} = req.params;
	const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	const imgs = req.files.map(f => ({url: f.path , filename: f.filename}));
	campground.images.push(...imgs);
	await campground.save();
	if(req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename)
		}
		await campground.updateOne({$pull : {images : {filename: {$in : req.body.deleteImages}}}})
	}
	req.flash('success' , "Successfully updated campground")
	res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	for (let image of campground.images) {
		filename = image.filename;
		await cloudinary.uploader.destroy(filename)
	}
	await Campground.findByIdAndDelete(id);
	req.flash('success' , "Successfully deleted campground")
	res.redirect('/campgrounds')
}
