const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//Needs to be a var because it can change
var db = require('./config/db');
var router = express.Router();
const app = express();
const port = 3000;
var User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(db.url);
var db = mongoose.connection;

router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/user')
    .post((req, res) => {
        if (req.body.username &&
            req.body.password &&
            req.body.passwordConf &&
            req.body.email) {

            let user = new User();
            user.username = req.body.username;
            user.password = req.body.password;
            user.email = req.body.email;
            user.passwordConf = req.body.passwordConf;

            user.save((err) => {
                if (err) {
                    res.send(err);
                }
                res.send({ "message": "User Was Created" });
            });
        }
    });

app.use('/api', router);

app.listen(port, () => {
    console.log("We are Live");
});
