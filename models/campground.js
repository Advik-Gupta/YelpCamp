const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

// --------------------------------------------------------------

const imageScehma = new Schema({
	url: String,
	filename: String
}) 

imageScehma.virtual('thumbnailImage').get(function() {
	return this.url.replace('/upload/w_1920,h_1080,c_fill' , '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
	title: String,
	price: Number,
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	images: [imageScehma],
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectID,
		ref: 'User'
	},
	reviews : [
		{
			type: Schema.Types.ObjectID,
			ref: 'Review'
		}
	]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
	if(doc) {
		await Review.deleteMany({
			_id: {
				$in : doc.reviews
			}
		})
	}
})

module.exports = mongoose.model('Campground', CampgroundSchema)