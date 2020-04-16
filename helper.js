const checkUserEmail = (emailToCheck, users) => {
  for (let userID in users) {
    if (users[userID].email === emailToCheck) {
      return userID;
    }
  }
};

module.exports = checkUserEmail;