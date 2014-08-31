

exports.index = function(req, res){
  console.log("exports.index");
  res.render('index');
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
