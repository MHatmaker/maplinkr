/*global exports */

var pusherRef = null,
    userNames = [
        {'name' : 'Orange', 'inuse' : false},
        {'name' : 'Grapefruit', 'inuse' : false},
        {'name' : 'Tangelo', 'inuse' : false},
        {'name' : 'Lemon', 'inuse' : false},
        {'name' : 'Lime', 'inuse' : false},
        {'name' : 'Peach', 'inuse' : false},
        {'name' : 'Apricot', 'inuse' : false},
        {'name' : 'Pear', 'inuse' : false},
        {'name' : 'Cherry', 'inuse' : false},
        {'name' : 'Boysenberry', 'inuse' : false},
        {'name' : 'Blackberry', 'inuse' : false},
        {'name' : 'Watermelon', 'inuse' : false},
        {'name' : 'Cantaloupe', 'inuse' : false},
        {'name' : 'Strawberry', 'inuse' : false},
        {'name' : 'Raspberry', 'inuse' : false},
        {'name' : 'Pomegranate', 'inuse' : false},
        {'name' : 'Quince', 'inuse' : false},
        {'name' : 'Grape', 'inuse' : false},
        {'name' : 'Mango', 'inuse' : false},
        {'name' : 'Kiwi', 'inuse' : false},
        {'name' : 'Coconut', 'inuse' : false},
        {'name' : 'Fig', 'inuse' : false},
        {'name' : 'Guava', 'inuse' : false},
        {'name' : 'Kumquat', 'inuse' : false},
        {'name' : 'Nectarine', 'inuse' : false}
    ],
    seqNo = 0,
    namesLength = userNames.length,
    wndNameSeqNo = 0;

exports.getAuth = function (req, res) {
    "use strict";
    console.log('getAuth');
    console.log('%s %s %s', req.method, req.url, req.path);
    console.log('req.body.socket_id is %s', req.body.socket_id);
    console.log('req.body.channel_name is %s', req.body.channel_name);
    var socketId = req.body.socket_id,
        channel = req.body.channel_name,
        auth = pusherRef.authenticate(socketId, channel);
    res.send(auth);
};

exports.setPusher = function (pshr) {
    "use strict";
    console.log("setPusher");
    pusherRef = pshr;
};

exports.getUserName = function (req, res) {
    "use strict";
    console.log("API getUserName");
    console.log('%s %s %s', req.method, req.url, req.path);
    if (seqNo === namesLength) {
        seqNo = 0;
        console.log("reset seqNo to zero");
    }
    console.log("return seqNo %s, name %s", seqNo, userNames[seqNo].name);
    res.json({'id' : seqNo, 'name' : userNames[seqNo].name});
    seqNo++;
};


exports.getUserId = function (req, res) {
    "use strict";
    console.log("API getUserId");
    console.log('%s %s %s', req.method, req.url, req.path);
    if (seqNo === namesLength) {
        seqNo = 0;
        console.log("reset seqNo to zero");
    }
    console.log("return seqNo %s ", seqNo);
    res.json({'id' : seqNo});
    seqNo++;
};

exports.getNextWindowSeqNo = function (req, res) {
    "use strict";
    console.log("API wndNameSeqNo");

    console.log("return wndNameSeqNo %s ", wndNameSeqNo);
    res.json({'wndNameSeqNo' : wndNameSeqNo});
    wndNameSeqNo++;
};
