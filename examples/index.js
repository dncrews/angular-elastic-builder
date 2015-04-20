var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(__dirname));
app.use('/js', express.static(path.join(__dirname, '../dist')));
app.use('/angular', express.static(path.join(__dirname, '../node_modules/angular-recursion')));

app.listen(process.env.PORT || 3000, function() {
  console.log('listening on ' + ( process.env.PORT || 3000));
});
