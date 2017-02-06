const { SHA256 } = require('crypto-js');

const message = 'I am user #1'
const hash = SHA256(message).toString();

const data = { id: 'kevin', };
const token = {
  data,
  hash: SHA256(JSON.stringify(data) + 'secretInfo').toString();
}

const resultHash = SHA256(JSON.stringify(token.data) + 'secretInfo').toString();
if (resultHash === token.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was changed. Don\'t trust it');
}

//=================================================

const jwt = require('jsonwebtoken');

const data = {
  id = 'kevin',
}
const token = jwt.sign(data, 'secretInfo');
console.log(token);

const decode = jwt.verify(token, 'secretInfo');
console.log(decode);
