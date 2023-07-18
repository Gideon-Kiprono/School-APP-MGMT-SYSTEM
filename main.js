const express = require("express");

const app = express();
//server static ?
const port = process.env.port || 3003;
app.get("/", (req, res) => {
  //root route
  console.log("root route requested!!");
  res.status(200);
  res.render("home.ejs");
  res.send("Home route in the server responding");
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
  res.render("newTeacher.ejs")
  console.log("new teacher added");
})
app.get("/newStudent", (req, res) => {
  res.render("newStudent.ejs")
  console.log("new student added");
})





//app.post("", () => { })

//Assignment--look into environment variables --show how to use .env file in a node project
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("App is running and listening on port 3003");
  }
});
