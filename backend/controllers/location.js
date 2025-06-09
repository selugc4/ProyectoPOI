const mongoose = require('mongoose');
const Loc = mongoose.model('Location');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { apiKey } = require('../environment/environment');
const { JWT_SECRET } = require('../environment/environment');
const fireBase = require('../environment/storeapp2-fc3a4-firebase-adminsdk-fbsvc-52b535f6df.json');
const admin = require('firebase-admin');
const { ChatGroq } = require('@langchain/groq');
const POIRoute = require('../services/routeAI');
const {GROQ_API_KEY} = require('../environment/environment');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(fireBase)
  });
}

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
const locationById = (req, res) => {
  const locationid = req.params.locationid;

  if (!locationid) {
    return sendJSONresponse(res, 400, { message: 'Falta el parámetro id' });
  }

  Loc.findById(locationid).exec()
    .then(location => {
      if (!location) {
        return sendJSONresponse(res, 404, { message: 'Location no encontrada' });
      }
      sendJSONresponse(res, 200, location);
    })
    .catch(err => {
      sendJSONresponse(res, 500, { message: 'Error al buscar la location', error: err });
    });
};
const locationsCreate = (req, res) => {
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    locality: req.body.locality,
    region: req.body.region,
    country: req.body.country,
    fsq_id: req.body.fsq_id,
    locationCoords: {
      type: 'Point',
      coordinates: [parseFloat(req.body.Otherlng), parseFloat(req.body.Otherlat)]
    },
    ownCoords: {
      type: 'Point',
      coordinates: [parseFloat(req.body.Ownlng), parseFloat(req.body.Ownlat)]
    },
    image: req.body.image,
    createdBy: req.body.createdBy
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
    fsq_id: loc.fsq_id,
    locationCoords: {
      type: 'Point',
      coordinates: [parseFloat(loc.Otherlng), parseFloat(loc.Otherlat)]
    },
    ownCoords: {
      type: 'Point',
      coordinates: [parseFloat(loc.Ownlng), parseFloat(loc.Ownlat)]
    },
    image: loc.image,
    createdBy: loc.createdBy
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
const foursquareSearch = async (req, res) => {
  const { name, lat, lng } = req.query;

  const hasCoords = lat && lng;
  const hasName = !!name;

  if ((lat && !lng) || (!lat && lng)) {
    return sendJSONresponse(res, 400, {
      message: 'Debes proporcionar ambas coordenadas: lat y lng.'
    });
  }

  if (hasName && !hasCoords) {
    return sendJSONresponse(res, 400, {
      message: 'La búsqueda por nombre debe ir acompañada de coordenadas.'
    });
  }

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

  try {
    const response = await axios.get('https://api.foursquare.com/v3/places/search', {
      headers: {
        Authorization: apiKey
      },
      params
    });

    const lugares = response.data.results;

    if (!lugares || lugares.length === 0) {
      return sendJSONresponse(res, 404, { message: 'No se encontraron lugares para ese criterio.' });
    }

    const fsqIds = lugares.map(l => l.fsq_id);

    const existingLocs = await Loc.find({ fsq_id: { $in: fsqIds } }).select('fsq_id').lean();
    const existingFsqIds = existingLocs.map(loc => loc.fsq_id);
    const nuevosLugares = lugares.filter(l => !existingFsqIds.includes(l.fsq_id));

    if (!nuevosLugares || nuevosLugares.length === 0) {
      return sendJSONresponse(res, 404, { message: 'No se encontraron lugares para ese criterio.' });
    }

    return sendJSONresponse(res, 200, nuevosLugares);
  } catch (err) {
    console.error('Error al consultar Foursquare:', err.message);
    sendJSONresponse(res, 500, { message: 'Error al obtener datos desde Foursquare.', error: err });
  }
};
const loginWithFirebaseToken = async (req, res) => {
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    return res.status(400).json({ message: 'Falta el token de Firebase' });
  }

  try {
    // Verifica el token de Firebase (ID Token)
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    
    // Aquí puedes acceder a datos del usuario, por ejemplo:
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Genera tu JWT con la info que necesites, por ejemplo el UID de Firebase
    const customJwt = jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: '1h' });

    // Devuelve el JWT propio al cliente
    return res.status(200).json({ token: customJwt });
  } catch (error) {
    console.error('Error verificando token Firebase:', error);
    return res.status(401).json({ message: 'Token Firebase inválido' });
  }
};
const locationsByUserAndCity = (req, res) => {
  const { userId, city } = req.query;

  if (!userId) {
    return sendJSONresponse(res, 400, { message: 'El parámetro userId es obligatorio' });
  }

  if (!city) {
    return sendJSONresponse(res, 400, { message: 'El parámetro city es obligatorio' });
  }

  // Hacemos búsqueda insensible a mayúsculas y que coincida en locality o region
  const cityRegex = new RegExp(city, 'i');

  Loc.find({
    createdBy: userId,
    $or: [
      { locality: cityRegex },
      { region: cityRegex }
    ]
  }).exec()
    .then(locations => {
      if (!locations || locations.length === 0) {
        return sendJSONresponse(res, 404, { message: 'No se encontraron locations para ese usuario y ciudad' });
      }
      sendJSONresponse(res, 200, locations);
    })
    .catch(err => {
      sendJSONresponse(res, 500, { message: 'Error al buscar locations', error: err });
    });
};
const recommendLocation = async (req, res) => {
  try {
    const { city, locations } = req.body;

    if (!city || !locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ message: 'Falta city o locations no es un array válido o está vacío' });
    }

    const model = new ChatGroq({
      apiKey: GROQ_API_KEY,
      model: 'deepseek-r1-distill-llama-70b', // tu modelo Groq
    });

    const poiRoute = new POIRoute(model);
    const recommendation = await poiRoute.getLocationRecommendation({ city, locations });

    return res.status(200).json(recommendation);
  } catch (error) {
    console.error('Error en recommendLocation:', error);
    return res.status(500).json({ message: 'Error generando recomendación', error: error.message });
  }
};
module.exports = {
  locationsReadByNameDatePlace,
  locationById,
  locationsCreate,
  locationsCreateMany,
  locationsDeleteOne,
  locationsUpdateOne,
  foursquareSearch,
  loginWithFirebaseToken,
  locationsByUserAndCity,
  recommendLocation
};