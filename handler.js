'use strict';

module.exports.test = async event => {
  return {
    statusCode: 200,
    body: 'Test'
  };

};

module.exports.hello = async event => {
  console.log('running Hello');
  
  return {
    statusCode: 200,
    body: 'Hello'
  }

};
