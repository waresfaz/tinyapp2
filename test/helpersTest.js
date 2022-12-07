const { assert } = require('chai');

const { checkUserEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkUserEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });

  it('should return undefined if the email is not in the database', function() {
    const user = checkUserEmail('bobert@robby.com', testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

});