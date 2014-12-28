var express = require('express');
var nano = require('nano');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app =  express();
var db = nano('http://localhost:5984/todos');

app.use(express.static(__dirname + '/')); 
app.use(bodyParser.json());

app.post('/api/todos/add', function(req, res) {
  var doc = req.body;
  doc.type = 'todo';
  db.insert(doc, function(err, body) {
    if(err) {
      return res.status(500).send(err);
    }
    res.status(200).send(body);
  });
});

app.get('/api/todos', function(req, res) {
  db.list({ include_docs: true }, function(err, body) {
    if(err) {
      return res.status(500).send(err);
    }
    var todos = _.pluck(body.rows, 'doc');
    res.status(200).send(todos);
  });
});

app.delete('/api/todos/:id', function(req, res) {
  db.get(req.params.id, function(err, body) {
    db.destroy(req.params.id, body._rev, function(err, body) {
      res.status(200).send({ deleted: true });
    });
  });
});

app.listen(3000);
