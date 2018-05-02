const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
//Needs to be a var because it can change
var db = require('./config/db');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(db.url, (err, client) => {
    if (err) console.log(err)
    db = client.db("testdatabase");
    require('./app/routes')(app, db);

    app.listen(port, () => {
        console.log("We are Live");
    });

});
