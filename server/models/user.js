const mongoose = require('mongoose');
const { isEmail } = require('validator');
// import isEmail from 'validator/lib/isEmail';
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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

UserSchema.methods.removeToken = function (token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: { token },
    },
  });
};

//model method
UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decode;

  try {
    decode = jwt.verify(token, 'abc123');
  } catch (err) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject();
  }

  return User.findOne({
    '_id': decode._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this;

  return User
    .findOne({ email })
    .then(user => {
      if (!user) return Promise.reject();

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) return resolve(user);
          return reject();
        });
      });
    });
};

UserSchema.pre('save', function (next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User,
};
