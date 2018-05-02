module.exports = function (app, db) {
    app.get('/', (req, res) => {
        res.send('Working');
    })
    
    app.post('/test', (req, res) => {
        res.send('Hello');
    });
}