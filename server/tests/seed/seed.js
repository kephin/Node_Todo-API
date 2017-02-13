const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const testUsers = [{
  _id: userOneId,
  email: 'kephin@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}, {
  _id: userTwoId,
  email: 'kevin@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}];

const populateUsers = (done) => {
  User
    .remove({})
    .then(() => {
      const userOne = new User(testUsers[0]).save();
      const userTwo = new User(testUsers[1]).save();
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

const testTodos = [{
  _id: new ObjectID(),
  text: 'Testing data #1',
  _creator: userOneId,
}, {
  _id: new ObjectID(),
  text: 'Testing data #2',
  _creator: userTwoId,
}];

const populateTodos = (done) => {
  Todo
    .remove({})
    .then(() => Todo.insertMany(testTodos))
    .then(() => done());
};

module.exports = {
  testTodos,
  testUsers,
  populateTodos,
  populateUsers,
};
