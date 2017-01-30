const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server!');
  }
  console.log('Connected to MongoDB server!');

  db.collection('Users')
    .deleteMany({ name: 'kevin' })
    .then(result => {
      console.log(result);
    });

  db.collection('Users')
    .findOneAndDelete({ _id: new ObjectID('588c45e0eac1f6b8e0b5f3eb') })
    .then(results => {
      console.log(JSON.stringify(results, undefined, 2));
    });

  // db.close();
});
