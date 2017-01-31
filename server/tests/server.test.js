const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

//add testing life cycle method: beforeEach, which let us run some code before every single test case
//we want to make sure DB is empty before any test
beforeEach(done => {
  Todo
    .remove({})
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
        Todo.find().then(todos => {
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
          expect(todos.length).toBe(0);
          done();
        }).catch(err => done(err));
      });
  });

});
