const checkUserEmail = (emailToCheck, users) => {
  for (let userID in users) {
    if (users[userID].email === emailToCheck) {
      return userID;
    }
  }
};

const urlsForUser = (id, urlDatabase) => {
  let filteredDatabase = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredDatabase[key] = urlDatabase[key];
    }
  }
  return filteredDatabase;
};

module.exports = { checkUserEmail, urlsForUser };