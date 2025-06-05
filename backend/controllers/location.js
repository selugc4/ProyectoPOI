const mongoose = require('mongoose');
const Loc = mongoose.model('Location');
const axios = require('axios');
const { apiKey } = require('../environment/environment');

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};
const locationsReadByNameDatePlace = (req, res) => {
  const { name, date, region } = req.query;
  const paramsUsed = [name, date, region].filter(Boolean); 

  if (paramsUsed.length > 1) {
    return sendJSONresponse(res, 400, {
      message: 'No debes proporcionar ningún parámetro o exactamente uno de los siguientes: name, date o region.'
    });
  }

 const query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  if (date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return sendJSONresponse(res, 400, { message: 'Fecha inválida. Usa formato YYYY-MM-DD.' });
    }

    const nextDate = new Date(dateObj);
    nextDate.setDate(dateObj.getDate() + 1);

    query.date = {
      $gte: dateObj,
      $lt: nextDate
    };
  }
  if (region) {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(region)) {
      return sendJSONresponse(res, 400, {
        message: 'Región inválida. Solo se permiten letras y espacios.'
      });
    }
    query.region = region;
  }  
    Loc.find(query).exec()
    .then(locations => {
        if (!locations || locations.length === 0) {
        return sendJSONresponse(res, 404, { message: 'No se encontraron locations con ese criterio' });
        }
        sendJSONresponse(res, 200, locations);
    })
    .catch(err => {
        sendJSONresponse(res, 500, { message: 'Error al buscar locations', error: err });
    });
};
const locationsCreate = (req, res) => {
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    locality: req.body.locality,
    region: req.body.region,
    country: req.body.country,
    locationCoords: {
      type: 'Point',
      coordinates: [parseFloat(req.body.Otherlng), parseFloat(req.body.Otherlat)]
    },
    ownCoords: {
      type: 'Point',
      coordinates: [parseFloat(req.body.Ownlng), parseFloat(req.body.Ownlat)]
    },
    image: req.body.image,
  })
  .then(location => sendJSONresponse(res, 201, location))
  .catch(err => sendJSONresponse(res, 500, err));
};
const locationsCreateMany = (req, res) => {
  const locations = req.body;

  const docsToInsert = locations.map(loc => ({
    name: loc.name,
    address: loc.address,
    locality: loc.locality,
    region: loc.region,
    country: loc.country,
    locationCoords: {
      type: 'Point',
      coordinates: [parseFloat(loc.Otherlng), parseFloat(loc.Otherlat)]
    },
    ownCoords: {
      type: 'Point',
      coordinates: [parseFloat(loc.Ownlng), parseFloat(loc.Ownlat)]
    },
    image: loc.image
  }));
  Loc.insertMany(docsToInsert)
  .then(docs => {
      sendJSONresponse(res, 201, docs);
    })
    .catch(err => {
      sendJSONresponse(res, 500, err);
    });
};
const locationsDeleteOne = (req, res) => {
  const locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findByIdAndDelete(locationid)
      .exec()
      .then(location => {
        if (!location) {
          return sendJSONresponse(res, 404, { message: "locationid not found" });
        }
        console.log("Location id " + locationid + " deleted");
        sendJSONresponse(res, 204, null);
      })
      .catch(err => {
        sendJSONresponse(res, 404, err);
      });
  } else {
    sendJSONresponse(res, 404, {"message": "No locationid"});
  }
};
const locationsUpdateOne = (req, res) => {
  if (!req.params.locationid) {
    sendJSONresponse(res, 404, {"message": "Not found, locationid is required"});
    return;
  }
 Loc.findById(req.params.locationid)
    .then(location => {
      if (!location) {
        sendJSONresponse(res, 404, { message: "locationid not found" });
        return Promise.reject('No location found'); 
      }

      location.name = req.body.name;
      location.address = req.body.address;
      location.locality = req.body.locality;
      location.region = req.body.region;
      location.country = req.body.country;
      location.image = req.body.image;
      location.locationCoords = {
        type: 'Point',
        coordinates: [parseFloat(req.body.Otherlng), parseFloat(req.body.Otherlat)]
      };
      location.ownCoords = {
        type: 'Point',
        coordinates: [parseFloat(req.body.Ownlng), parseFloat(req.body.Ownlat)]
      };

      return location.save();
    })
    .then(updatedLocation => {
      if (updatedLocation) { 
        sendJSONresponse(res, 200, updatedLocation);
      }
    })
    .catch(err => {
      if (err !== 'No location found') {
        sendJSONresponse(res, 400, err);
      }
    });
};
const foursquareSearch = (req, res) => {
  const { name, lat, lng } = req.query;

  const hasCoords = lat && lng;
  const hasName = !!name;

  // Validación: ambos o ninguno
  if ((lat && !lng) || (!lat && lng)) {
    return sendJSONresponse(res, 400, {
      message: 'Debes proporcionar ambas coordenadas: lat y lng.'
    });
  }

  // Validación: name requiere coords
  if (hasName && !hasCoords) {
    return sendJSONresponse(res, 400, {
      message: 'La búsqueda por nombre debe ir acompañada de coordenadas.'
    });
  }

  // Validación de coordenadas numéricas y rango
  if (hasCoords) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return sendJSONresponse(res, 400, {
        message: 'Latitud y longitud deben ser números válidos.'
      });
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return sendJSONresponse(res, 400, {
        message: 'Latitud debe estar entre -90 y 90, longitud entre -180 y 180.'
      });
    }
  }

  const params = {
    limit: 20,
    sort: 'RATING'
  };

  if (hasName && hasCoords) {
    params.query = name;
    params.ll = `${lat},${lng}`;
  } else if (hasCoords) {
    params.ll = `${lat},${lng}`;
  } else {
    params.near = 'Madrid';
  }

  axios.get('https://api.foursquare.com/v3/places/search', {
    headers: {
      Authorization: apiKey
    },
    params
  })
  .then(response => {
    const lugares = response.data.results;
    if (!lugares || lugares.length === 0) {
      return sendJSONresponse(res, 404, { message: 'No se encontraron lugares para ese criterio.' });
    }
    sendJSONresponse(res, 200, lugares);
  })
  .catch(err => {
    console.error('Error al consultar Foursquare:', err.message);
    sendJSONresponse(res, 500, { message: 'Error al obtener datos desde Foursquare.', error: err });
  });
};
module.exports = {
  locationsReadByNameDatePlace,
  locationsCreate,
  locationsCreateMany,
  locationsDeleteOne,
  locationsUpdateOne,
  foursquareSearch
};