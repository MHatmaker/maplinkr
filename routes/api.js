
var pusherRef = null;

exports.getAuth = function(req, res) {

    console.log('getAuth');
    console.log('%s %s %s', req.method, req.url, req.path);
    console.log('req.body.socket_id is %s', req.body.socket_id);
    console.log('req.body.channel_name is %s', req.body.channel_name);
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    var auth = pusherRef.authenticate( socketId, channel );
    res.send( auth );
};  

exports.setPusher = function(pshr){
    console.log("setPusher");
    pusherRef = pshr;
}

     var userNames = [
                {'name' : 'Orange', 'inuse' : false},
                {'name' : 'Grapename', 'inuse' : false},
                {'name' : 'Tangelo', 'inuse' : false},
                {'name' : 'Lemon', 'inuse' : false},
                {'name' : 'Lime', 'inuse' : false},
                {'name' : 'Peach', 'inuse' : false},
                {'name' : 'Apricot', 'inuse' : false},
                {'name' : 'Pear', 'inuse' : false},
                {'name' : 'Cherry', 'inuse' : false},
                {'name' : 'Boysenberry', 'inuse' : false},
                {'name' : 'Blakberry', 'inuse' : false},
                {'name' : 'Watermelon', 'inuse' : false},
                {'name' : 'Cantaloupe', 'inuse' : false},
                {'name' : 'Strawberry', 'inuse' : false},
                {'name' : 'Raspberry', 'inuse' : false},
                {'name' : 'Pomegranate', 'inuse' : false},
                {'name' : 'Quince', 'inuse' : false},
                {'name' : 'Grape', 'inuse' : false},
                {'name' : 'Mango', 'inuse' : false},
                {'name' : 'Kiwi', 'inuse' : false}
                ];
                
exports.getUserName = function(req, res){
    console.log("API getUserName");
    console.log('%s %s %s', req.method, req.url, req.path);
    var validUser = false;
    while(validUser == false){
        var seqNo = Math.floor(Math.random() * userNames.length);
        var nextName = userNames[seqNo];
        if(nextName.inuse == false){
            validUser = true;
            userNames[seqNo].inuse = true;
            console.log('seqNo ' + seqNo + ' name ' + userNames[seqNo].name);
            res.json({'id' : seqNo, 'name' : userNames[seqNo].name});
        }
    }
    if(validUser == false){
        res.json({'id' : 'bad id', 'name' : 'No names available'});
    }
};
    