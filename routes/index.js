

exports.index = function(req, res){
  console.log("exports.index");
  res.render('index');
};

exports.indexchannel = function(req, res){
  console.log("exports.indexchannel");
  var name = req.params.name;
  console.log(name);
  res.render('/' + name);
};

exports.agonewwindow = function(req, res){
  console.log("exports.agonewwindow");
  res.render('agonewwindow');
};

exports.partials = function (req, res) {
  console.log("exports.partials");
  var name = req.params.name;
  console.log(name);
  res.render('partials/' + name);
};

exports.templates = function (req, res) {
console.log("exports.templates");
var name = req.params.name;
console.log(name);
res.render('Templates/' + name + '.jade');
};
