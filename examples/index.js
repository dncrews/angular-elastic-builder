var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(__dirname));
app.use('/js', express.static(path.join(__dirname, '../dist')));
app.use('/angular-recursion', express.static(path.join(__dirname, '../node_modules/angular-recursion')));
app.use('/angular-ui-bootstrap', express.static(path.join(__dirname, '../node_modules/angular-ui-bootstrap/dist')));
app.use('/moment', express.static(path.join(__dirname, '../node_modules/moment')));
app.use('/angular-moment', express.static(path.join(__dirname, '../node_modules/angular-moment')));

app.listen(process.env.PORT || 3000, function() {
  console.log('listening on ' + ( process.env.PORT || 3000));
});
