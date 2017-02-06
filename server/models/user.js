const mongoose = require('mongoose');
const { isEmail } = require('validator');
// import isEmail from 'validator/lib/isEmail';
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: isEmail,
      message: '{VALUE} is not a valid e-mail',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  }],
});

// we cant override the original method
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

// we can add instance methods inside the UserSchema.methods object
// don't use arrow function here, because we need this to bind with user instance
UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  // create a token
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

  // update the token to the database
  user.tokens.push({ access, token });

  // return to the client
  return user
    // save to the database
    .save()
    .then(() => token);
};

const User = mongoose.model('User', UserSchema);

module.exports = {
  User,
};
