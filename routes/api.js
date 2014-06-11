var fs = require("fs");
var marked = require("marked");
var path = require('path');

// New Code
var mongo = require('mongodb');
var monk = require('monk');

var mongodb_connection_string = 'localhost:27017/' + 'rhsmarkdown';

//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + 'rhsmarkdown';
}

var db = monk(mongodb_connection_string);

/* GET doclist page. */
exports.getDocs = function(req, res) {
    console.log("docList to hit MongoDB");
    var collection = db.get('docCollection');
    collection.find({},{},function(e,docs){
        console.log('bunch of docs');
        console.log(docs[0]);
        res.json({
          doclist: docs
        });
    });
};


exports.getDoc = function(req, res) {

    console.log('get SpecificDoc, md simple');
    console.log('%s %s %s', req.method, req.url, req.path);
    console.log('req.params.id is %s', req.params.id); //('id'));
    var collection = db.get('docCollection');
    collection.findById(req.params.id,function(err, doc){
		if (err) res.json(500, err);
		else if (doc){
            console.log("docPath : " + doc.url);
            var html_dir = './';
            fs.readFile( path.join(html_dir, doc.url), function (err, data) {
                if (err) {
                    //throw err;
                    console.log("error");
                    console.log(err);
                }
                // console.log(data.toString());
                var mrked = marked(data.toString()); 
                res.json({ Doc: doc.url, DocContents: mrked })
            })  ;
        }    
		else res.json(404);
	});
};  