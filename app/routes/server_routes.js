module.exports = function (app, db) {
    const collection =
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
}