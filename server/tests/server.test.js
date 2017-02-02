const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const testData = [{
  _id: new ObjectID(),
  text: 'Testing data #1',
}, {
  _id: new ObjectID(),
  text: 'Testing data #2',
}];

//add testing life cycle method: beforeEach, which let us run some code before every single test case
//now we want to make DB has some data
beforeEach(done => {
  Todo
    .remove({})
    .then(() => {
      return Todo.insertMany(testData);
    })
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'new todo for testing';

    request(app)
      .post('/todos')
      //send data
      .send({ text })
      //assert if the request status is 200
      .expect(200)
      //assert if the respond body has a text property equals to the one we sent
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        //assert if the data got stored in mongoDB collection
        Todo.find({ text }).then(todos => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(err => done(err));
      });
  });

  it('should NOT create todo with invalid body data', (done) => {

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find().then(todos => {
          expect(todos.length).toBe(2);
          done();
        }).catch(err => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should list all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${testData[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(testData[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    const testID = new ObjectID();
    request(app)
      .get(`/todos/${testID.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if invalid id', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    request(app)
      .delete(`/todos/${testData[1]._id.toHexString()}`)
      .expect(200).expect(res => {
        expect(res.body.todo.text).toBe(testData[1].text);
      })
      .end((err, res) => {
        if (err) return done(err);
        // check the deleted document is gone
        Todo
          .findById(testData[1]._id.toHexString())
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(err => done(err));

        // or check the number of the documents remains 1
        // Todo
        //   .find()
        //   .count()
        //   .then(count => {
        //     expect(count).toBe(1);
        //     done();
        //   })
        //   .catch(err => done(err));
      });
  });

  it('should return 404 if todo not found', (done) => {
    const testID = new ObjectID();
    request(app)
      .delete(`/todos/${testID.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if invalid id', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});
