var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    comments: String,
    likes: Number
});

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;