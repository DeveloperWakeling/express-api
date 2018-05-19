var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    passwordConf: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

UserSchema.pre('save', function(next) {
      var user = this;
      bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        user.passwordConf = hash;
        next();
      })
    });

var User = mongoose.model('User', UserSchema);
module.exports = User;