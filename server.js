const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//Needs to be a var because it can change
var db = require('./config/db');
var router = express.Router();
const app = express();
const port = 3000;
var jwt = require('jsonwebtoken');
var User = require('./models/user');
var Post = require('./models/post');
var Auth = require('./config/auth');

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
    })
    .get((req, res) => {
        User.find((err, users) => {
            if (err) {
                res.send(err);
            }
            res.json(users);
        })
    });

router.route('/user/:userid')
    .get((req, res) => {
        User.findById(req.params.userid, (err, user) => {
            if (err) {
                res.send(err);
            }
            // res.json(user);
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
        let tkn = jwt.decode(token);
        
        res.json({ token: tkn });
    });


router.route('/login')
    .post((req, res) => {
        User.findOne({ username: req.body.username }, (err, user) => {
            if (err) {
                res.send({ error: "An error occured" });
            }
            user.comparePasswords(req.body.password, function (err, isMatch) {
                if (err) {
                    res.send({ error: err });
                }
                if (!isMatch) {
                    res.status(401);
                }
                const token = jwt.sign({ user }, Auth.secretKey);
                res.json({ token: token });
            });
        })
    });


app.use('/api', router);

app.listen(port, () => {
    console.log("We are Live");
});
