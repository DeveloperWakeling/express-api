const server_routes = require('./server_routes');

//Allows for multiple exports in one and better readability
module.exports = function(app, db){
    server_routes(app, db);
}