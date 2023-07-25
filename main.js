const express = require("express");
const mysql = require("mysql");
var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sams",
});

const app = express();
//middleware
app.use(express.static("public")); //Static files middeware
app.use(midfunc);
app.use(express.urlencoded({ extended: false })); //supply req.body with the form data
//server static files in express
const port = process.env.port || 3003;

function midfunc(req, res, next) {
  console.log(req.path);
  console.log("I am a midleware function!");
  //Logic --e.g. authorization
  next();
}

app.get("/", (req, res) => {
  conn.query("SELECT * FROM  students", (sqlerr1, students) => {
    if (!sqlerr1) {
      //continue
      conn.query("SELECT *FROM teachers", (sqlerr2, teachers) => {
        if (sqlerr2) {
          res.send("Database Error Occured");
        } else {
          console.log(students);
          console.log(teachers);
          res.render("home.ejs", { students: students, teachers: teachers });
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
  console.log("new teacher added");
});
app.get("/newStudent", (req, res) => {
  res.render("newStudent.ejs");
  console.log("new student added");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
  console.log('Login page ready!!');
})

//POST ROUTES

app.post("/login", () => {
  //save the data to db and compare if the deatails exists so as to accept the request for access
  //redirect user to home route
  //const email = req.body["login-email"];
  //const password = req.body["login-password"];

  // Validate the submitted email and password (You can add more validation here)
  // if (!email || !password) {
  //    res.send("Wrong Password/email");
  // } else {
  //   res.redirect("/")
  // }
  // console.log(req.body);
})

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
  console.log(req.body);
  conn.query(
    "INSERT INTO teachers(tsc_no,full_mame,phone,email,passkey,role) VALUES(?,?,?,?,?,?)",
    [
      req.body.tsc,
      req.body.name,
      req.body.phone,
      req.body.email,
      req.body.pass,
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

//Assignment--look into environment variables --show how to use .env file in a node project
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("App is running and listening on port 3003");
  }
});
