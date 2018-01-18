const ieRoutes = require('./ieRoutes');

module.exports = function(app, db){
    ieRoutes(app, db);
    
};