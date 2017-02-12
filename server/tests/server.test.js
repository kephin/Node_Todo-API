const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { testTodos, populateTodos, testUsers, populateUsers } = require('./seed/seed');

//add testing life cycle method: beforeEach, which let us run some code before every single test case
//now we want to make DB has some data
beforeEach(populateUsers);
beforeEach(populateTodos);

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
      .get(`/todos/${testTodos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(testTodos[0].text);
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
      .delete(`/todos/${testTodos[1]._id.toHexString()}`)
      .expect(200).expect(res => {
        expect(res.body.todo.text).toBe(testTodos[1].text);
      })
      .end((err, res) => {
        if (err) return done(err);
        // check the deleted document is gone
        Todo
          .findById(testTodos[1]._id.toHexString())
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

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const patchData = {
      text: 'learn node',
      completed: true,
      shouldNotExist: 'wrong data',
    };

    request(app)
      .patch(`/todos/${testTodos[0]._id.toHexString()}`)
      .send(patchData)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(patchData.text);
        expect(res.body.todo.completed).toBe(patchData.completed);
        expect(res.body.todo.completedAt).toBeA('number');
        expect(res.body.todo.shouldNotExist).toNotExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo
          .findById(testTodos[0]._id.toHexString())
          .then(todo => {
            expect(todo.text).toBe(patchData.text);
            expect(todo.completed).toBe(patchData.completed);
            expect(todo.completedAt).toBeA('number');
            expect(todo.shouldNotExist).toNotExist();
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    request(app)
      .patch(`/todos/${testTodos[0]._id.toHexString()}`)
      .send({
        completed: false,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo
          .findById(testTodos[0]._id.toHexString())
          .then(todo => {
            expect(todo.completed).toBe(false);
            expect(todo.completedAt).toNotExist();
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe('GET /users/me', () => {
  it('should returns user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(testUsers[0]._id.toHexString());
        expect(res.body.email).toBe(testUsers[0].email);
      })
      .end(done);
  });

  it('should returns 401 if NOT authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'example@example.com';
    const password = 'mndb123';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) return done(err);

        User
          .findOne({ email })
          .then(user => {
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'hello',
        password: '123',
      })
      .expect(400)
      .end(done);
  });

  it('should NOT create a user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: testUsers[0].email,
        password: 'helloworld123',
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send(_.pick(testUsers[1], ['email', 'password']))
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        User
          .findById(testUsers[1]._id)
          .then(user => {
            expect(user.tokens[0]).toInclude({
              access: 'auth',
              token: res.headers['x-auth'],
            });
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: testUsers[1].email,
        password: 'wrong_password',
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        User
          .findById(testUsers[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(err => done(err));
      });
  });
});
