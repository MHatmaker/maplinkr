

function process(req, res) {
    console.log('I Made it to Express');

    console.log('%s %s %s', req.method, req.url, req.path);
    console.log('req.body.name %s', req.body.name);
    console.log('req.body.email is %s', req.body.email);
    console.log('req.body.message is %s', req.body.message);
}
exports.process = process;