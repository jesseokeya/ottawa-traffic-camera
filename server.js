// import dependencies
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const request = require('request');
const {
  credentials
} = require('./config');
const {notWorkingCards} = require('./invalid');
const app = express();

// set app port
const PORT = process.env.PORT || 3000;

app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', `http://localhost:${PORT}`);

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(cors());
app.use(logger('dev'));
//get app scripts images and styles
app.use(express.static(__dirname + "/src/resources/"));

// render index page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

app.get('/credentials', (req, res) => {
  res.send({
    data: credentials,
    statusCode: 200,
    message: 'Ottawa Traffic Camera Access Credentials'
  });
})

app.get('/invalidCards', (req, res) => {
  res.send({
    data: notWorkingCards,
    statusCode: 200,
    message: 'Array Of All Camera Locations Without A Working Image'
  })
});

app.get('/cityCameras', (req, res) => {
  const url = 'http://traffic.ottawa.ca/map/camera_list';
  request(url, (err, response) => {
    if (err) {
      throw err;
    }
    res.json(JSON.parse(response.body));

  });
});

// listen to port
app.listen(PORT, () => console.log(`App Running On PORT *${PORT}`));
