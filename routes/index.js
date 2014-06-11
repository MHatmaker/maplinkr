

exports.index = function(req, res){
  console.log("exports.index");
  res.render('index');
};

exports.partials = function (req, res) {
  console.log("exports.partials");
  var name = req.params.name;
  res.render('partials/' + name);
};
