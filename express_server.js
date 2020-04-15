const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  let result = '';
  let chars = 'qwertyuiopasdfghjklzxcvbnm1234567890'

  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * 36);
    result += chars[index];
  }
  return result;
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

app.post("/login", (req, res) => {
  const username = req.body
  console.log(username.username)
  res.cookie("username", username.username)
  res.redirect("/urls");
})

app.get("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

// BELOW ARE NEW REQUEST HANDLERS. ABOVE WAS JUST TESTING

app.get("/urls", (req, res) => {
    let templateVars = { 
      urls: urlDatabase,
      username: req.cookies["username"]
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
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = { 
    shortURL, longURL,
    username: req.cookies["username"]
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