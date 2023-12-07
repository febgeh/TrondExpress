const express = require("express");
const db = require("better-sqlite3")("database.db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  
    if (!user) {
      res.status(401).send("Invalid email or password");
      return;
    }
  
    const compare = bcrypt.compareSync(password, user.password);
  
    if (compare) {
      req.session.user = user;
      if (user.rolle === "admin") {
        res.redirect("/admin/");
      } else {
        res.redirect("/");
      }
    } else {
      res.status(401).send("Invalid email or password");
    }
  });


app.listen(3000, () => {
console.log(`Server running on port 3000`);
});
