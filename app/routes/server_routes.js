var ObjectId = require('mongodb').ObjectId;

module.exports = function (app, db) {
    app.post('/post', (req, res) => {
        //Will end up creating something here
        const post = { user: req.body.user, title: req.body.title, text: req.body.text };
        db.collection('posts').insert(post, (err, result) => {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else {
                res.send(result.ops[0]);
            }
        })
    });
    app.get('/post/:id', (req, res) => {
        //Get the id param
        const o_id = new ObjectId(req.params.id);
        const details = { '_id':  o_id};
        db.collection('posts').findOne(details, (err, item) => {
            if(err){
                res.send({'error': 'An error has occurred'});
            }
            else {
                res.send(item);
            }
        })
    })
}