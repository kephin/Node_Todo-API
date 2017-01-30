const mongoose = require('mongoose');

// use the built-in Promise library
mongoose.Promise = global.Promise;

// mongoose maintains collections over time, so we don't have to use callback function as MongoClient did
mongoose.connect('mongodb://localhost:27017/TodoApp');

//create model with certain attributes
const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  // createdAt is stored in ObjectID
  completedAt: {
    type: Number,
    default: null,
  },
});

const newTodo = new Todo({
  text: 'Feed the cat',
  completed: true,
  //This field will be filtered since it is not in the Todo model
  test: 123,
});

newTodo
  .save()
  .then((doc) => {
    console.log('Saved todo', doc);
  }, (err) => {
    console.log('Unable to save todo', err);
  });
