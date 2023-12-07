import express from "express";
import { join } from "path";
import Database from "better-sqlite3";
import bcrypt  from "bcrypt"
import cookieParser from "cookie-parser";
import { UserTest, roller } from "./types";

const db = Database("database.db", { verbose: console.log });
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, "public")));
app.use(cookieParser())
/* app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
); */

const insertStmt = db.prepare(
  `INSERT INTO user (name, email, rolle, password, phone, adress, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?);`
);

const findUserByIdStmt = db.prepare("SELECT * FROM user WHERE id = ?")
const findUserByEmailStmt = db.prepare("SELECT * FROM user WHERE email = ?")

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmailStmt.get(email) as UserTest

  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }

  const compare = bcrypt.compareSync(password, user.password);

  if (compare) {
    res.cookie("token", user.id, {maxAge: 1000*60*60*24*7, httpOnly: true })
    if (user.rolle === "admin") {
      res.redirect("/admin/");
    } else if (user.rolle === "leder"){
      res.redirect("/leder/");
    } else {
      res.redirect("/medlem/")
    }
  } else {
    res.status(401).send("Invalid email or password");
  }
});


app.post("/addUser", (req, res) => {
  const token = req.cookies.token
  const user = findUserByIdStmt.get(token) as UserTest

  if(!user) {
    res.redirect("/login")
  } else if (user.rolle != "admin") {
    res.redirect("/")
  }else{
    const { name, email, rolle, password } = req.body;
    const userTest = findUserByEmailStmt.get(email)
  
    if (userTest) { 
      res.status(409).send("Email already exists");
    } else {
      const hash = bcrypt.hashSync(password, 6);
      insertStmt.run(name, email, rolle, hash, "", "", "",);
      setTimeout(() => {
        res.redirect("/admin/edit/");
      }, 1000);
    }
  }
 
  // const { name, email, rolle, password } = req.body;
  // const userTest = findUserByEmailStmt.get(email)
  // const InSTMT = db.prepare("INSERT INTO user (name, email, rolle, password) VALUES (?, ?, ?, ?);")

  // if (userTest) { 
  //   res.status(409).send("Email already exists");
  // } else {
  //   const hash = bcrypt.hashSync(password, 6);
  //   InSTMT.run(name, email, rolle, hash);
  //   setTimeout(() => {
  //     res.redirect("/admin/edit/");
  //   }, 1000);
  // }

});

app.post("/post/slettBruker/:id", (req, res) => {
  const id = req.params.id;
  const deleteStatement = db.prepare("DELETE FROM user WHERE id = ?");
  deleteStatement.run(id);
  res.redirect("/admin/edit");
});

app.post("/post/redigerBruker", (req, res) => {
  const { id, name, email, rolle, phone, adress, birthdate, peletong_id } = req.body;

  const token = req.cookies.token
  const user = findUserByIdStmt.get(token) as UserTest

  if (name != user.name) {
    const updateStatement = db.prepare(
      "UPDATE user SET name = ? WHERE id = ?"
    );
    updateStatement.run(name, id);
  }

  if (email != user.email) {
    const updateStatement = db.prepare(
      "UPDATE user SET email = ? WHERE id = ?"
    );
    updateStatement.run(email, id);
  }

  if (rolle != user.rolle) {
    if (rolle != "velg") {
      const updateStatement = db.prepare(
        "UPDATE user SET rolle = ? WHERE id = ?"
      );
      updateStatement.run(rolle, id);
    }
  }

  if (phone != user.phone) {
    const updateStmt = db.prepare("UPDATE user SET phone = ? WHERE id = ?");
    updateStmt.run(phone, id);
  }

  if (birthdate != user.birthdate) {
    const updateStmt = db.prepare("UPDATE user SET birthdate = ? WHERE id = ?");
    updateStmt.run(birthdate, id);
  }

  if (adress != user.adress) {
    const updateStmt = db.prepare("UPDATE user SET adress = ? WHERE id = ?");
    updateStmt.run(adress, id);
  }

  // const stmt = db.prepare("SELECT * FROM user WHERE id = ?");
  // const peletong_idData = stmt.all()
  // if(peletong_idData.peletong_id === null || peletong_id != user.peletong_id){
  //   const updateStmt = db.prepare("UPDATE user SET peletong_id = ? WHERE id = ?");
  //   updateStmt.run(peletong_id, id);
  // }
  if(peletong_id != user.peletong_id){
    const updateStmt = db.prepare("UPDATE user SET peletong_id = ? WHERE id = ?");
    updateStmt.run(peletong_id, id);
  }


  res.redirect("/admin/edit");
});

app.use((req, res, next) => {
  const token = req.cookies.token 


  if (!token) {
    res.redirect("/");
    return;
  }
  const user = findUserByIdStmt.get(token) as UserTest

  if (user.rolle === "admin") {
    next();
  } else {
    res.redirect("/");
  }
}, express.static("admin")); 

app.post("/createPeletong", (req, res) => {
  const { name , kompani_id} = req.body;
  const createStmt = db.prepare(`INSERT INTO peletong (name, kompani_id) VALUES (?, ?);`);
  createStmt.run(name, kompani_id);
  setTimeout(() => {
    res.redirect("/admin/");
  }, 1000);
});

app.post("/createKompani", (req, res) => {
  const { name } = req.body;
  const createStmt = db.prepare(`INSERT INTO kompani (name) VALUES (?);`);
  createStmt.run(name);
  setTimeout(() => {
    res.redirect("/admin/");
  }, 1000);
});

app.get("/json/kompani", (req, res) => {
  const stmt = db.prepare("SELECT * FROM kompani");
  const kompanier = stmt.all()
  res.json(kompanier)
});

app.get("/json/peletong", (req, res) => {
  const stmt = db.prepare("SELECT * FROM peletong");
  const peletonger = stmt.all()
  res.json(peletonger)
});

app.get("/json/users", (req, res) => {
  const users = db.prepare("SELECT * FROM user").all();
  console.log("user", users)
  res.json(users)
});

app.get("/admin/edit/user/:id", (req, res) => {
  res.sendFile(join(__dirname, "public/admin/edit/user.html"));
});

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});
 
