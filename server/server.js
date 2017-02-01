const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  // console.log(req.body);
  const todo = new Todo(req.body);

  todo
    .save()
    .then(doc => {
      //status(200) is default
      res.send(doc);
    }, err => {
      res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
  Todo.find().then(todos => {
    res.send({ todos });
  }, err => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(404).send();

  Todo
    .findById(id)
    .then(todo => {
      if (todo) return res.send({ todo });
      res.status(404).send();
    })
    .catch(err => res.status(404).send());
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = {
  app,
};
