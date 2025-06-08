//required app modules
const express = require("express");
const path = require("path");
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./public/swagger/swagger.json');
const cors = require('cors');


const app = express();
let port=process.env.PORT || 3000;
let uri=process.env.MONGO_CONNECTION_STRING;

app.use(cors({
  origin: process.env.REACT_URL || 'http://localhost:3000',
  credentials: true
}));

//database connection
mongoose.connect(uri).then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.log(err);
})

//middleware
app.use(bodyParser.json()); //parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); //allowing for extended syntax (i.e. arrays, objects, nested objects, etc.)

const api_v01 = '/api/v01/';

//routes
app.use('/', express.static(path.join(__dirname, 'public'))); 
app.use(api_v01 + 'docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
app.use(api_v01 + 'docjs', express.static('./public/apidocjs')); 
app.use(api_v01, require("./controllers/routes/requisitionRoute")); //requisition route
app.use(api_v01, require("./controllers/routes/catalogRoute")); //catalog route

app.get("/", (req, res) => {
    res.send("Hello, World!");
  });
  

app.listen(port, () => {
    console.log("Server running on port: " + port);
})