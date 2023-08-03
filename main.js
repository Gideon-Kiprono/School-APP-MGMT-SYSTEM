const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 6;
const mysql = require("mysql");
const session = require("express-session");
var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sams",
});
conn.connect((connerr) => {
  if (connerr) {
    console.log("Cannot connect to db");
  } else {
    console.log("connection successful");
  }
});

//middlewares
const app = express();
app.use(
  session({
    secret: "secret word",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static("public")); //Static files middeware
app.use(express.urlencoded({ extended: false })); //supply req.body with the form data
app.use(authFunc);
//server static files in express
const port = process.env.port || 3003;

function authFunc(req, res, next) {
  let protectedRoutes = ["/permissions", "/newStaff", "/newStudent"];
  console.log(protectedRoutes.includes(req.path));
  if (protectedRoutes.includes(req.path) && !req.session.staff) {
    res.status(401).res.render("401.ejs");
    
  } else {
    next();
  }
}
app.get("/", (req, res) => {
  conn.query("SELECT * FROM  students", (sqlerr1, students) => {
    if (!sqlerr1) {
      //continue
      conn.query("SELECT *FROM teachers", (sqlerr2, teachers) => {
        if (sqlerr2) {
          res.send("Database Error Occured");
        } else {
          // console.log(students);
          // console.log(teachers);
          if (req.session.staff) {
            res.render("home.ejs", {
              students: students,
              teachers: teachers,
              user: req.session.staff,
            });
          } else {
            res.render("home.ejs", { students: students, teachers: teachers });
          }
        }
      });
    } else {
      res.send("Database Error Occured");
    }
  });
});

app.get("/anonymous", (req, res) => {
  conn.query("SELECT COUNT(reg_no)as num FROM students", (sqlerr, dataone) => {
    if (sqlerr) {
      console.log(sqlerr);
    }
    conn.query(
      "SELECT COUNT(reg_no)as numm FROM student_attendance WHERE DAY(time_stamp) =11 AND (type ='SpecialIN' OR type='NomalIN')",
      (errr, dataTwo) => {
        if (errr) {
          console.log(errr);
        }
        console.log(dataTwo);
        res.render("home.ejs", {
          numberOfStudents: dataone[0].num,
          presentStudents: dataTwo[0].numm,
        });
      }
    );
  });
});
app.get("/news/sports/epl-transfers", (req, res) => {
  //sports route
  console.log("sports route requested!!");
  res.status(200);
  res.render("blog.ejs");
  // res.send("Sports route in the server responding");
});
app.get("/settings", (req, res) => {
  //settings route
  console.log("settings route requested!!");
  res.status(200);
  // res.render(blog.ejs)
  // res.send("Settings route in the server responding");
});
app.get("/newStaff", (req, res) => {
  res.render("newTeacher.ejs");
  // console.log("new teacher added");
});
app.get("/newStudent", (req, res) => {
  res.render("newStudent.ejs");
  // console.log("new student added");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
  // console.log('Login page ready!!');
});
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
  // console.log('Login page ready!!');
});
app.get("/permissions", (req, res) => {
  conn.query(
    "SELECT * FROM `teacher_permission` JOIN teachers ON teacher_permission.tsc_no =teachers.tsc_no",
    (sqlerr, data) => {
      if (sqlerr) {
        res.send("Database Error");
      } else {
        conn.query("SELECT tsc_no FROM teachers", (sqlerr, numbers) => {
          res.render("permissions.ejs", {
            Permissions: data,
            Numbers: numbers,
          });
        });
      }
    }
  );
});

//POST ROUTES

app.post("/login", (req, res) => {
  //login - authenticate
  //- Receive passkey and tsc no
  // console.log(req.body);
  //Look for the clients tsc no in the db --req.body.tsc

  conn.query(
    "SELECT * FROM teachers WHERE tsc_no =?",
    [Number(req.body.tsc)],
    (sqlerr, dbresult) => {
      if (sqlerr) {
        res.send("Database error Occured");
      } else {
        console.log(dbresult);
        if (dbresult.length < 1) {
          res.send("User with Tsc " + req.body.tsc + " does not exist");
        } else {
          console.log(dbresult); // sure tsc no exist in the db
          if (bcrypt.compareSync(req.body.passkey, dbresult[0].passkey)) {
            //Create a session
            req.session.staff = dbresult[0];
            req.session.cookie.expires = new Date(Date.now() + 10000); //16 minutes
            res.redirect("/");
          } else {
            res.send("Incorrect password");
          }
        }
      }
    }
  );
  //If exist, compare the saved passkey with the client passkey
  //- If they match, authorize  for access( Create a session)
  //encryptions
});

app.post("/addnewStudent", (req, res) => {
  //save the data to db
  console.log(req.body);
  //redirect user to home/root route
  conn.query(
    "INSERT INTO students(reg_no,fullname,class) VALUES(?,?,?)",
    [req.body.reg_no, req.body.name, Number(req.body.class)],
    (sqlerr) => {
      if (sqlerr) {
        console.log(sqlerr);
        res.send("A DB error occured while saving new student");
      } else {
        res.redirect("/");
      }
    }
  );
});
app.post("/addStaff", (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.pass, saltRounds);
  console.log(req.body);
  conn.query(
    "INSERT INTO teachers(tsc_no,full_mame,phone,email,passkey,role) VALUES(?,?,?,?,?,?)",
    [
      req.body.tsc,
      req.body.name,
      req.body.phone,
      req.body.email,
      hashedPassword,
      req.body.role,
    ],
    (sqlErr) => {
      if (sqlErr) {
        console.log(sqlErr);
        res.send("An DB error occured!!");
      } else {
        res.redirect("/");
      }
    }
  );
});
app.get("*", (req, res) => {
  res.status(404).render("404.ejs");
});

//Assignment--look into environment variables --show how to use .env file in a node project
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("App is running and listening on port 3003");
  }
});
