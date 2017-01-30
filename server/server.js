const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  // console.log(req.body);
  const todo = new Todo(req.body);

  todo
    .save()
    .then(doc => {
      // console.log('Save succeedly', doc);
      res.send(doc);
    }, err => {
      // console.log('Unable to save data', err);
      res.status(400).send(err);
    });
});

app.listen(3000, () => {
  console.log('Start on part 3000...');
});
