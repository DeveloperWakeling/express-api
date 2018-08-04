const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bunyan = require('bunyan');
const bunyanLogzioStream = require('logzio-bunyan');
//Needs to be a var because it can change
var db = require('./config/db');
var router = express.Router();
const app = express();
const port = 3000;
var loggerOptions = require('./config/logger').loggerOptions;
var jwt = require('jsonwebtoken');
var User = require('./models/user');
var Post = require('./models/post');
var Auth = require('./config/auth');

var logzioStream = new bunyanLogzioStream(loggerOptions);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var prod = process.env.NODE_ENV === 'production';
if(prod){
    mongoose.connect(db.url);
}
else {
    mongoose.connect(db.localhost_url);
}
var db = mongoose.connection;

var logger = bunyan.createLogger({
    name: 'yaas',
    streams: [
        {
            type: 'raw',
            stream: logzioStream
        }
    ]
});

router.use(function (req, res, next) {
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// router.get('/', function (req, res) {
//     // logger.info('Working');
//     res.json({ message: 'hooray! welcome to our api!' });
// });

router.route('/user')
    .post((req, res) => {
        if (req.body.username &&
            req.body.password &&
            req.body.passwordConf &&
            req.body.email) {

            let user = new User();
            if(req.body.name){
                user.name = req.body.name;
            }
            user.username = req.body.username;
            user.password = req.body.password;
            user.email = req.body.email;
            user.passwordConf = req.body.passwordConf;

            user.save((err) => {
                if (err) {
                    if(err.code === 11000){
                        res.send({ duplicate: true});
                    }
                    else{
                        res.send(err);
                    }
                }
                else {
                    const token = jwt.sign({ user }, Auth.secretKey);
                    res.json({ token: token, loggedIn: true });
                }
                // res.send({ "message": "User Was Created" });
            });
        }
    })
    .get((req, res) => {
        User.find((err, users) => {
            if (err) {
                res.send(err);
            }
            else{
                res.json(users);
            }
        })
    });

router.route('/user/:userid')
    .get((req, res) => {
        User.findById(req.params.userid, (err, user) => {
            if (err) {
                res.send(err);
            }
        }).populate('posts').exec((err, posts) => {
            res.send(posts);
        });
    })
    .put((req, res) => {
        User.findByIdAndUpdate(req.params.userid, req.body, { new: true }, (err, user) => {
            if (err) {
                res.send(err);
            }
            res.json(user);
        })
    });

router.route('/post')
    .post((req, res) => {
        if (req.body.userid && req.body.title && req.body.body) {
            let post = new Post();
            post.author = req.body.userid;
            post.title = req.body.title;
            post.body = req.body.body;
            post.save((err) => {
                if (err) {
                    res.send(err);
                }
                User.findById(post.author, (err, user) => {
                    user.posts.push(post);
                    user.save();
                })
                res.send(post);
            });
        }
    });

router.route('/post/:postid')
    .get((req, res) => {
        Post.findById(req.params.postid, (err, post) => {
            if (err) {
                res.send(err);
            }
        }).populate('author', 'username email').exec((err, author) => {
            res.send(author);
        });
    });

router.route('/protected')
    .get(Auth.ensureToken, (req, res) => {
        let token = req.token;
        let tkn;
        try {
            tkn = jwt.decode(token);
        }
        catch(e) {
            res.status(401).send({error: 'Unauthorized'});
            return;
        }
        
        res.send({ token: tkn });
    });


router.route('/login')
    .post((req, res) => {
        User.findOne({ username: req.body.username }, (err, user) => {
            if (err) {
                res.send({ error: "An error occured" });
            }
            else if(user === null){
                res.json({err: "No User Found"});
            }
            else {
                user.comparePasswords(req.body.password, function (err, isMatch) {
                    if (err) {
                        res.send({ error: err });
                    }
                    if (!isMatch) {
                        res.status(401).send({ error: 'Unauthorized'});
                    }
                    else {
                        const token = jwt.sign({ user }, Auth.secretKey,{ expiresIn: '7d'});
                        res.json({ token: token, loggedIn: true });
                    }
                });
            }
        })
    });


app.use('/api', router);

app.listen(port, () => {
    console.log("We are Live");
});
