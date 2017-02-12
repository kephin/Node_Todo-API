require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo(req.body);

  todo
    .save()
    .then(newTodo => res.send(newTodo))
    .catch(err => res.status(400).send(err));
});

app.get('/todos', (req, res) => {
  Todo
    .find()
    .then(todos => res.send({ todos }))
    .catch(err => res.status(400).send(err));
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(404).send();

  Todo
    .findById(id)
    .then(todo => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    })
    .catch(err => res.status(400).send(err));
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(404).send();

  Todo
    .findByIdAndRemove(id)
    .then(todo => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    })
    .catch(err => res.status(400).send(err));
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  // screen out properties that shouldn't be touched by clients
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) return res.status(404).send();
  // logic between completed and completedAt
  if (typeof body.completed === 'boolean' && body.completed) body.completedAt = new Date().getTime();
  else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo
    .findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    })
    .catch(err => res.status(400).send(err));
});

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  user
    .save()
    .then(user => user.generateAuthToken())
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(err => res.status(400).send(err));
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  /*const { email, password } = req.body;
  res.send({ email, password });*/
  const body = _.pick(req.body, ['email', 'password']);
  User
    .findByCredentials(body.email, body.password)
    .then(user => {
      return user
        .generateAuthToken()
        .then(token => {
          res.header('x-auth', token).send(user);
        });
    })
    .catch(err => res.status(400).send(err));
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => res.status(400).send());
});

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = {
  app,
};
