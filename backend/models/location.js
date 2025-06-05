const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    author: String,
    rating: {type: Number, required: true, min: 0, max: 5},
    reviewText: String,
    createdOn: {type: Date, "default": Date.now }
});

const locationSchema = new mongoose.Schema({
    name: {type: String, required: true},
    address: String,
    locality: String,
    region: String,
    country: String,
    fsq_id: String,
    locationCoords: {
        type: {type: String},
        coordinates: [Number]
    },
    ownCoords: {
        type: {type: String},
        coordinates: [Number]
    },
    reviews: [reviewSchema],
    image: String,
    date: {type: Date, default: Date.now}
});

locationSchema.index({locationCoords: '2dsphere'});
locationSchema.index({ownCoords: '2dsphere'});

mongoose.model('Location', locationSchema);