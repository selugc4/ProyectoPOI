const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};
const getReviewsByLocationId = (req, res) => {
  const { locationid } = req.params;

  Loc.findById(locationid)
    .select('reviews')
    .exec()
    .then(location => {
      if (!location) {
        return sendJSONresponse(res, 404, { message: 'Location no encontrada.' });
      }
      sendJSONresponse(res, 200, location?.reviews || []);
    })
    .catch(err => {
      sendJSONresponse(res, 500, {
        message: 'Error del servidor al obtener las reviews.',
        error: err
      });
    });
};
const addReview = (req, res) => {
  const { locationid } = req.params;

  Loc.findById(locationid)
    .exec()
    .then(location => {
      if (!location) {
        return sendJSONresponse(res, 404, { message: 'Location no encontrada.' });
      }

      const { author, rating, reviewText } = req.body;

      location.reviews.push({
        author,
        rating,
        reviewText,
        createdOn: new Date()
      });

      return location.save();
    })
    .then(updatedLocation => {
      const newReview = updatedLocation.reviews[updatedLocation.reviews.length - 1];
      sendJSONresponse(res, 201, newReview);
    })
    .catch(err => {
      sendJSONresponse(res, 500, {
        message: 'Error al añadir la review',
        error: err
      });
    });
};
const deleteReview = (req, res) => {
  const { locationid, reviewid } = req.params;

  Loc.updateOne(
    { _id: locationid },
    { $pull: { reviews: { _id: reviewid } } }
  )
  .then(result => {
    if (result.modifiedCount === 0) {
      return sendJSONresponse(res, 404, { message: 'Location o Review no encontrada' });
    }
    sendJSONresponse(res, 204, null);
  })
  .catch(err => {
    sendJSONresponse(res, 500, {
      message: 'Error al eliminar la review',
      error: err
    });
  });
};
module.exports = {
    getReviewsByLocationId,
    addReview,
    deleteReview
};