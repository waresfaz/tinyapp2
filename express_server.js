const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const { checkUserEmail, urlsForUser } = require("./helper");
const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

// generates 6 character alphanumeric string
const generateRandomString = function() {
  let result = '';
  let chars = 'qwertyuiopasdfghjklzxcvbnm1234567890';

  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * 36);
    result += chars[index];
  }
  return result;
};

// users database
const users = {
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


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: ['userID']},
  "9sm5xK": { longURL: "http://www.google.com", userID: ['userID']}
};

// GET and POST Handlers below

app.get("/login", (req, res) => {
  res.render("login");
});

// allows a user to login with a valid email and password
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userID = checkUserEmail(email, users);

  if (!userID) {
    res.status(403).send("Email not valid. Please register.");
    return;
  } else if (!bcrypt.compareSync(password, users[userID].password)) {
    res.status(403).send("Password incorrect. Please try logging in again");
  }

  req.session.user_id = userID;
  res.redirect("/urls");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// logs out user and clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render("register");
});

// allows a new user to register a valid email and password
app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let userInfo = {
    id: userID,
    email: email,
    password: hashedPassword
  };

  if (email === "" || password === "") {
    res.status(400).send("Field cannot be empty");
    return;
  } if (checkUserEmail(email, users)) {
    res.status(400).send("Email already in use. Please enter a different email.");
    return;
  }

  users[userID] = userInfo;

  req.session.user_id = userID;
  res.redirect("urls");
});

// displays table of urls specific to a user when logged in
app.get("/urls", (req, res) => {
  let filteredUrls = urlsForUser(req.session.user_id, urlDatabase);

  if (!users[req.session.user_id]) {
    res.status(403).send("Please Login or Register!");
  } else {
    let templateVars = {
      filteredUrls: filteredUrls,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

// allows looged in user to to add a new long url
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[newShortURL] = {
    longURL : longURL,
    userID: req.session.user_id
  };

  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };

  if (!users[req.session.user_id]) {
    res.redirect("/login");
    return;
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(403).send("Please login or register!");
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL, longURL,
    user: users[req.session.user_id]
  };

  res.render("urls_show", templateVars);
});

// allows logged in, owner of url to delete it
app.post("/urls/:shortURL/delete", (req, res) => {
  let userUrl = urlsForUser(req.session.user_id, urlDatabase);

  for (let key in userUrl) {
    if (req.params.shortURL === key) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("You are not authorized to delete this URL!");

});

// allows logged in, owner of url to update it
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  let newLongURL = req.body.longURL;
  let userUrl = urlsForUser(req.session.user_id, urlDatabase);

  for (let key in userUrl) {
    if (id === key) {
      urlDatabase[id].longURL = newLongURL;
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send("You are not authorized to update this URL!");
});

// redirects user to long url when they click short url link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// listens to start server
app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});