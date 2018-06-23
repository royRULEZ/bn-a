//var ObjectID = require('mongodb').ObjectID;
const googleTrends  = require('google-trends-api');
const axios = require('axios');

module.exports = function(app, db){

    app.get('/20-boy-names', function (req, res) {
        let random_num = (Math.floor(Math.random() * 50)) + 100;
        let sql = 'SELECT name FROM `names_all` WHERE rank_2017 > '+ random_num +' AND gender = "M" LIMIT 20';
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/20-girl-names', function (req, res) {
        let random_num = (Math.floor(Math.random() * 50)) + 100;
        let sql = 'SELECT name FROM `names_all` WHERE rank_2017 > '+ random_num +' AND gender = "F" LIMIT 20';
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });   

    app.get('/random-name', function (req, res) {
        let random_num = (Math.floor(Math.random() * 250)) + 100;
        console.log("-----", random_num);
        let sql = 'SELECT name, gender, `2017`, `2016`, `2015`, `2014`, `2013`, `2012`, `2011` FROM `names_all` WHERE rank_2017 > '+ random_num +' LIMIT 1';
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/wikipedia/:term', (req, result) => { 
        const term_ = req.params.term;

        axios.get('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch='+term_+'&format=json')
          .then(response => {
            console.log(response.data);
            result.send(response.data.query.search);
          })
          .catch(error => {
            console.log(error);
          });

    });
    
    app.get('/meaning/:term', (req, result) => { 
        const term_ = req.params.term;

        axios.get('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch='+term_+'&format=json')
          .then(response => {
            console.log(response.data);
            result.send(response.data.query.search[0].snippet);
          })
          .catch(error => {
            console.log(error);
          });

    });

    app.get('/imdb/:term', (req, result) => { 
        const term_ = req.params.term;

        axios.get('https://v2.sg.media-imdb.com/suggests/'+term_[0].toLowerCase()+'/'+term_.toLowerCase()+'.json')
          .then(response => {
            let string = response.data;
            string = string.substr(6+term_.length);
            string = string.slice(0, -1);
            result.send(string);

          })
          .catch(error => {
            console.log(error);
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

    app.get('/google-autocomplete/:term', (req, result) => { 
        const term_ = req.params.term;
        googleTrends.autoComplete({keyword: term_})
        .then((res) => {
            result.send(res);
        })
        .catch((err) => {
            console.log(err);
            result.send({ 'error': 'An error has occured'});
        })             
    });
        
    
    
    app.get('/explore-names', function (req, res) {
        
        // Build the Query String
        let where_ = [];
        let where_str = "";
        let page = 1;
        let offset = 0;
        let limit = 100;

        console.log("Request Query", req.query);

        if(req.query.page){page=parseInt(req.query.page)}
        if(req.query.g){where_.push("gender = '"+req.query.g+"' ");}
        if(req.query.a){console.log("Alphabet");where_.push("name LIKE '"+req.query.a+"%' ");}        
        if(req.query.l){where_.push("LENGTH(name) = "+req.query.l+" ");}

        console.log("Page Requested", page);

        if(req.query.p){
            switch(req.query.p){
                case "Popular":
                    if(req.query.g == "F"){where_.push("rank_2017 BETWEEN "+1+" AND "+200+" ORDER BY rank_2017 ASC");}
                    if(req.query.g == "M"){where_.push("rank_2017 BETWEEN "+1+" AND "+200+" ORDER BY rank_2017 ASC");}
                    break;
                case "Unique":
                    if(req.query.g == "F"){where_.push("rank_2017 BETWEEN "+201+" AND "+700+"  ORDER BY rank_2017 ASC");}
                    if(req.query.g == "M"){where_.push("rank_2017 BETWEEN "+201+" AND "+700+"  ORDER BY rank_2017 ASC");}                    
                    break;     
                case "Uncommon":
                    if(req.query.g == "F"){where_.push("rank_2017 BETWEEN "+701+" AND "+1000+" ");}
                    if(req.query.g == "M"){where_.push("rank_2017 BETWEEN "+701+" AND "+1000+" ");}                    
                    break;   
                case "Rare":
                    if(req.query.g == "F"){where_.push("rank_2017 BETWEEN "+1001+" AND "+3000+" ");}
                    if(req.query.g == "M"){where_.push("rank_2017 BETWEEN "+1001+" AND "+3000+" ");}
                    break;
                case "Obscure":
                    if(req.query.g == "F"){where_.push("rank_2017 BETWEEN "+3001+" AND "+10999+" ");}
                    if(req.query.g == "M"){where_.push("rank_2017 BETWEEN "+3001+" AND "+8999+" ");}                    
                    break;     
                case "Original":
                    if(req.query.g == "F"){where_.push("rank_2017 BETWEEN "+11000+" AND "+15795+" ");}
                    if(req.query.g == "M"){where_.push("rank_2017 BETWEEN "+9000+" AND "+12171+" ");}                    
                    break;
                case "Forgotten":
                    if(req.query.g == "F"){where_.push("rank_2017 = 18310 ORDER BY sum DESC");}
                    if(req.query.g == "M"){where_.push("rank_2017 = 14161 ORDER BY sum DESC")}                    
                    break;  

            }
        }
        
        for(var i = 0; i < where_.length; i++){
            where_str += where_[i];
            if(where_.length != 1 && i != (where_.length-1)){
                where_str += "AND ";
            }
        }

        let sqlCount = 'SELECT COUNT(name) AS numNames FROM `names_all` WHERE '+where_str;
        let sqlCount_val = 0;
        let queryCount = db.query(sqlCount, (err, resultsCount) => {
            if(err) throw err;      
            console.log("Number of Pages", Math.ceil(resultsCount[0].numNames/limit)); 
            offset = limit * (page - 1);
            let sql = 'SELECT name FROM `names_all` WHERE '+where_str+' LIMIT '+limit+' OFFSET '+offset+''; //LIMIT '+resultsCount[0].numNames
            console.log("Query: ", sql);
            let query = db.query(sql, (err2, results) => {
                if(err2) throw err2;
                res.send({pagecount: Math.ceil(resultsCount[0].numNames/limit), allnames: results});
            }); 

        });          

       
    });


    app.get('/name', function (req, res) { 
        //let sql = "SELECT * FROM `names` WHERE name = '" + req.query.n + "' AND gender = '" + req.query.g + "'";
        console.log("HI");
        let sql = "SELECT * FROM `names_all` WHERE name = '" + req.query.n + "' ORDER BY rank_2017 ASC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });


    app.get('/variations/:name', function (req, res) { 
        let name_ = req.params.name;
        if(name_.length > 4){
            name_ = name_.substring(0, name_.length - 2); 
        }
        let sql = "SELECT DISTINCT name FROM `names_all` WHERE name LIKE '" + name_ + "%' ORDER BY rank_2017 ASC LIMIT 13";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });    

    app.get('/history/:name', function (req, res) { 
        let name_ = req.params.name;
        let sql = "SELECT * FROM `names_all` WHERE name = '" + name_ + "' ORDER BY year ASC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });      

    app.get('/namehistory/:name', function (req, res) { 
        let name_ = req.params.name;
        let sql = "SELECT * FROM `names_all` WHERE name = '" + name_ + "' ORDER BY sum DESC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    });  

    app.get('/namehistory20/:name', function (req, res) { 
        let name_ = req.params.name;
        let sql = "SELECT name, gender, `2017`, `2016`, `2015`, `2014`, `2013`, `2012`, `2011`, `2010`, `2009`, `2008`, `2007`, `2006`, `2005`, `2004`, `2003`, `2002`, `2001`, `2000`, `1999`, `1998`, `1997` FROM `names_all` WHERE name = '" + name_ + "' ORDER BY sum DESC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/namehistory7/:name', function (req, res) { 
        let name_ = req.params.name;
        let sql = "SELECT name, gender, `2017`, `2016`, `2015`, `2014`, `2013`, `2012`, `2011` FROM `names_all` WHERE name = '" + name_ + "' ORDER BY sum DESC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/origin/:name', function (req, res) { 
        let name_ = req.params.name;
        //let sql = "SELECT origin FROM `origin` WHERE name = '" + name_ + "'";
        let sql = "SELECT collection.name FROM collection INNER JOIN collection_names ON collection_names.collection_id=collection.id WHERE collection_names.name = '" + name_ + "' AND collection.type = 'origin'";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/get-collections/:name', function (req, res) { 
        let name_ = req.params.name;
        //let sql = "SELECT origin FROM `origin` WHERE name = '" + name_ + "'";
        //let sql = "SELECT collection.name, collection.url FROM collection INNER JOIN collection_profiles ON collection_profiles.collection_id=collection.id WHERE collection_profiles.firstname = '" + name_ + "' AND collection.type != 'origin'";
        let sql = "SELECT collection.id, collection.name, collection.url FROM collection INNER JOIN collection_profiles ON collection_profiles.collection_id=collection.id WHERE collection_profiles.firstname = '" + name_ + "' AND collection.type != 'origin' UNION SELECT collection.id, collection.name, collection.url FROM collection INNER JOIN collection_names ON collection_names.collection_id=collection.id WHERE collection_names.name = '" + name_ + "' AND collection.type != 'origin'";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/collection/:name', function (req, res) { 
        let name_ = req.params.name;
        let sql = "SELECT * FROM `collection` WHERE url = '" + name_ + "'";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/collection-names/:id', function (req, res) { 
        let id_ = req.params.id;
        let sql = "SELECT * FROM `collection_names` WHERE collection_id = " + id_ + " ORDER BY name ASC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/collection-profiles/:id', function (req, res) { 
        let id_ = req.params.id;
        let sql = "SELECT * FROM `collection_profiles` WHERE collection_id = " + id_ + " ORDER BY sequence ASC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/collection-featured', function (req, res) { 
        let id_ = req.params.id;
        let sql = "SELECT * FROM `collection` WHERE featured != 0 ORDER BY featured ASC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/collections', function (req, res) { 
        let sql = "SELECT name, url FROM `collection` WHERE type != 'origin' ORDER BY name ASC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/collections/:char', function (req, res) { 
        let char_ = req.params.char;
        let sql = "SELECT name, url FROM `collection` WHERE type != 'origin' AND name LIKE '"+char_+"%' ORDER BY name ASC";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/collections-popular', function (req, res) { 
        let sql = "SELECT id, name, url FROM `collection` WHERE type != 'origin' ORDER BY name ASC LIMIT 8";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

    app.get('/ad-cluster', function (req, res) { 
        let sql = "SELECT * FROM `affiliate` WHERE featured = 1";
        console.log(sql);
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            res.send(results);
        });        
    }); 

}