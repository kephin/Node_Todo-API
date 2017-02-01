const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');

// remove all
Todo
  .remove({})
  .then(result => {
    console.log(result);
  });

// remove some
Todo
  .remove({
    completed: true,
  })
  .then(result => {
    console.log(result);
  });

// remove the first one find and return one
Todo
  .findOneAndRemove({
    text: 'do the hair cut',
  })
  .then(todo => {
    console.log(todo);
  });

// remove by id and return one
Todo
  .findByIdAndRemove('58918cd9527b87300c005303')
  .then(todo => {
    console.log(todo);
  });
