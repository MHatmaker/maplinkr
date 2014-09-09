
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
    