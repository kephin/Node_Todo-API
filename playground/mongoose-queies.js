const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');

const id = '5890488d4f2946281029c7c3';

if (!ObjectID.isValid(id)) console.log('ID not valid');

Todo
// grap all and returns an array of objects
  .find({
    // mongoose will convert string id to the ObjectID for you
    // _id: id,
    completed: false,
  })
  .then(todos => {
    console.log(todos);
  });

Todo
//grap the first query, which only returns an object
  .findOne({
    // _id: id,
    completed: false,
  })
  .then(todo => {
    console.log(todo);
  });

Todo
  .findById(id)
  .then(todo => {
    // for valid ID, but not found -> return Null
    if (!todo) return console.log('ID not found.');
    console.log(todo);
  })
  // for invalid ID -> return error
  .catch(err => console.log(err));
