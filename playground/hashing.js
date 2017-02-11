const data = { id: 'kevin' };

//===========
//  SHA256
//===========
const { SHA256 } = require('crypto-js');

const message = 'I am user #1';
const hash = SHA256(message).toString();

const token_SHA256 = {
  data,
  hash: SHA256(JSON.stringify(data) + 'secretInfo').toString(),
};

const resultHash = SHA256(JSON.stringify(token_SHA256.data) + 'secretInfo').toString();
if (resultHash === token_SHA256.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was changed. Don\'t trust it');
}

//================
//  JsonWebToken
//================
const jwt = require('jsonwebtoken');

const token_jwt = jwt.sign(data, 'secretInfo');
console.log(token_jwt);

const decode = jwt.verify(token_jwt, 'secretInfo');
console.log(decode);

//============
//  bcrypt
//============
const bcrypt = require('bcryptjs');

const password = '123abc';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});

bcrypt.compare(password, '$2a$10$BeyqkmJenGHmj1Orwn99quKquqMMwl0WrYyzbVofioESwNvCHz756', (err, res) => {
  console.log(res);
});
