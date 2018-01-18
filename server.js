const express       = require('express');
const mysql         = require('mysql');
const bodyParser    = require('body-parser');

// Create connection
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dbrootpassword',
    database : 'babynamr'
});

const app           = express();
const port          = 8088;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

db.connect((err) => {
    if(err){throw err}
    console.log("MYSQL Connected");
    require('./app/routes')(app, db);
    
    app.listen(port, () => {
        console.log('We are live on ' + port);
    });    
});

