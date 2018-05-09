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

    app.get('/post', (req, res) => {
       db.collection('posts').find({}).toArray((err, items) => {
            if(err){
                res.send({'error': 'An error has occurred' });
            }
            else {
                res.send(items);
            }
       });
    });

    app.get('/post/:id', (req, res) => {
        //Get the id param
        const o_id = new ObjectId(req.params.id);
        const details = { '_id': o_id };
        db.collection('posts').findOne(details, (err, item) => {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else {
                res.send(item);
            }
        })
    });

    app.delete('/post/:id', (req, res) => {
        const o_id = new ObjectId(req.params.id);
        const details = { "_id": o_id };
        db.collection('posts').remove(details, (err, item) => {
            if (err) {
                res.send({ "error": "An error has occurred" });
            }
            else {
                res.send('Post ' + req.params.id + ' deleted!');
            }
        });
    });

    app.put('/post/:id', (req, res) => {
        const o_id = new ObjectId(req.params.id);
        const details = { "_id": o_id};
        const post = { text: req.body.text, title: req.body.title };
        //takes the query params, the updated information
        db.collection('posts').update(details, post, (err, item) => {
            if(err){
                res.send({ "error" : "An error has occurred"});
            }
            else {
                res.send(post);
            }
        });
    });
}