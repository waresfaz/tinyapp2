const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const checkUserEmail = require("./helper");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

// generates 6 character alphanumeric string
function generateRandomString() {
  let result = '';
  let chars = 'qwertyuiopasdfghjklzxcvbnm1234567890'

  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * 36);
    result += chars[index];
  }
  return result;
}

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
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userID = checkUserEmail(email, users);
  console.log(userID, email, password)

  if (!userID) {
    res.status(403).send("Email not valid. Please register.")
    return;
  } else if (password !== users[userID].password) {
    res.status(403).send("Password incorrect. Please try logging in again");
  }

  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.get("/logout", (req, res) => {
  res.clearCookie('user');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register")
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email
  let password = req.body.password;
  // console.log(userID, email, password);
  let userInfo = { 
    id: userID, 
    email: email, 
    password: password 
  }
  // console.log(userInfo)

  if (email === "" || password === "") {
    res.status(400).send("Field cannot be empty");
    return;
  } if (checkUserEmail(email, users)) {
    res.status(400).send("Email already in use. Please enter a different email.");
    return;
  }

  users[userID] = userInfo;
  console.log(users);

  res.cookie("user_id", userID)
  res.redirect("urls")
});

// BELOW ARE NEW REQUEST HANDLERS. ABOVE WAS JUST TESTING

app.get("/urls", (req, res) => {
    let templateVars = { 
      urls: urlDatabase,
      // username: req.cookies["username"]
      user: req.cookies.user_id
    }
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);
  newShortURL = generateRandomString()
  // console.log(newShortURL)
  urlDatabase[newShortURL] = req.body.longURL
  console.log("akjdfhkajdfh" + urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies.user_id }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = { 
    shortURL, longURL,
    // username: req.cookies["username"]
    user: req.cookies.user_id
  }
  // console.log(longURL)
  // res.redirect(longURL);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id
  // console.log(id)
  let newLongURL = req.body.longURL
  // console.log(newLongURL);
  urlDatabase[id] = newLongURL
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

// /urls/:shortURL - showing the user the newly created link
// /u/:shortURL - is the one for redirecting

// listens to start server
app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});