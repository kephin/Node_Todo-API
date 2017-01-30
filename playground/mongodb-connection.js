const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server!');
  }
  console.log('Connected to MongoDB server!');

  // here we can just insert data before even create a collection

  db.collection('Todos').insertOne({
    text: 'Something to do',
    completed: false,
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  db.collection('User').insertOne({
    name: 'kevin',
    age: 29,
    location: 'taipei',
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user', err);
    }
    console.log(JSON.stringify(result, undefined, 2));
  });

  db.close();
});
