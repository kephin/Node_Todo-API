const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server!');
  }
  console.log('Connected to MongoDB server!');

  db.collection('Todos')
    // update the item and get the new document back
    .findOneAndUpdate({ _id: new ObjectID('588c14bfeac1f6b8e0b5f0fb') }, {
      // update operators
      $set: {
        text: 'walk the cat',
      },
    }, {
      returnOriginal: false,
    }).then(result => {
      console.log(result);
    });

  db.collection('Users')
    .findOneAndUpdate({ _id: new ObjectID('588c1e39eac1f6b8e0b5f1b8') }, {
      // update operators
      $set: {
        name: 'kevin',
      },
      $inc: {
        age: 5,
      },
    }, {
      returnOriginal: false,
    }).then(results => {
      console.log(results);
    });
  // db.close();
});
