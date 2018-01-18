//var ObjectID = require('mongodb').ObjectID;
const googleTrends  = require('google-trends-api');

module.exports = function(app, db){

    app.get('/20-boy-names', function (req, res) {
        let random_num = (Math.floor(Math.random() * 50)) + 100;
        let sql = 'SELECT name FROM `names` WHERE rank > '+ random_num +' AND gender = "M" LIMIT 20';
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/20-girl-names', function (req, res) {
        let random_num = (Math.floor(Math.random() * 50)) + 100;
        let sql = 'SELECT name FROM `names` WHERE rank > '+ random_num +' AND gender = "F" LIMIT 20';
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });   

    
    app.get('/google-trends/:term', (req, result) => { 
        const term_ = req.params.term;
        googleTrends.interestOverTime({keyword: term_}) //1231
        .then((res) => {
            result.send(res);
        })
        .catch((err) => {
            result.send({ 'error': 'An error has occured'});
        })             
    });

    app.get('/google-region/:term', (req, result) => { 
        const term_ = req.params.term;
        googleTrends.interestByRegion({keyword: term_})
        .then((res) => {
            result.send(res);
        })
        .catch((err) => {
            result.send({ 'error': 'An error has occured'});
        })             
    });
        
    
    
    app.get('/explore-names', function (req, res) {
        
        // Build the Query String
        let where_ = [];
        let where_str = "";
        if(req.query.g){where_.push("gender = '"+req.query.g+"' ");}
        if(req.query.a){where_.push("name LIKE '"+req.query.a+"%' ");}        
        if(req.query.l){where_.push("LENGTH(name) = "+req.query.l+" ");}

        if(req.query.p){
            switch(req.query.p){
                case "Popular":
                    if(req.query.g == "F"){where_.push("rank BETWEEN "+1+" AND "+100+" ");}
                    if(req.query.g == "M"){where_.push("rank BETWEEN "+1+" AND "+100+" ");}
                    break;
                case "Unique":
                    if(req.query.g == "F"){where_.push("rank BETWEEN "+101+" AND "+700+" ");}
                    if(req.query.g == "M"){where_.push("rank BETWEEN "+101+" AND "+700+" ");}                    
                    break;     
                case "Uncommon":
                    if(req.query.g == "F"){where_.push("rank BETWEEN "+701+" AND "+875+" ");}
                    if(req.query.g == "M"){where_.push("rank BETWEEN "+701+" AND "+800+" ");}                    
                    break;   
                case "Rare":
                    if(req.query.g == "F"){where_.push("rank BETWEEN "+876+" AND "+930+" ");}
                    if(req.query.g == "M"){where_.push("rank BETWEEN "+801+" AND "+880+" ");}
                    break;
                case "Obscure":
                    if(req.query.g == "F"){where_.push("rank BETWEEN "+931+" AND "+945+" ");}
                    if(req.query.g == "M"){where_.push("rank BETWEEN "+881+" AND "+901+" ");}                    
                    break;     
                case "Original":
                    if(req.query.g == "F"){where_.push("rank BETWEEN "+946+" AND "+1000+" ");}
                    if(req.query.g == "M"){where_.push("rank BETWEEN "+902+" AND "+1000+" ");}                    
                    break;                       

            }
        }
        
        //where_.push("popularity = '"+req.query.p+"' ");
        
        for(var i = 0; i < where_.length; i++){
            where_str += where_[i];
            if(where_.length != 1 && i != (where_.length-1)){
                where_str += "AND ";
            }
        }


        let sql = 'SELECT name FROM `names` WHERE '+where_str+' LIMIT 200';
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });


    app.get('/name', function (req, res) { 
        let sql = "SELECT * FROM `names` WHERE name = '" + req.query.n + "' AND gender = '" + req.query.g + "'";
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });

}