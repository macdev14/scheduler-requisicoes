//required app modules
const express = require("express");
const path = require("path");
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./public/swagger/swagger.json');


const app = express();
let port=process.env.PORT || 3000;
let uri=process.env.MONGO_CONNECTION_STRING;

//database connection
mongoose.connect(uri).then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.log(err);
})

//middleware
app.use(bodyParser.json()); //parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); //allowing for extended syntax (i.e. arrays, objects, nested objects, etc.)

//routes
app.use('/', express.static(path.join(__dirname, 'public'))); //available static route at http://localhost:5565
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //serve api documentation
app.use('/api-docjs', express.static('./public/apidocjs')); //available route at http://localhost:5565/api-docjs/
app.use("/api", require("./routes/userRoute")); //user route

app.get("/", (req, res) => {
    res.send("Hello, World!");
  });
  

app.listen(port, () => {
    console.log("Server running on port: " + port);
})