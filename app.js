const express = require("express");
const app = express();
const path = require("path")
const routes = require("./routes.js")
const controller = require("./controller.js")


app.set("view engine",'ejs');
app.set("views", path.join(__dirname, "views"))

app.use('/css', express.static(path.resolve(__dirname,"assets/css")))
app.use('/js', express.static(path.resolve(__dirname,"assets/js")))


app.get("/", routes);
app.post("/register", routes);
app.get("/register", routes);
app.get("/login", routes);
app.post("/login", routes);
app.get("/home", routes);
app.get("/logout", routes);
app.get("/index", routes);

app.get("/add_user", routes);
app.post("/add_user", routes);
app.get('/delete/:id', routes);
app.get("/api/users", controller.findstudent);

app.get("/add_faculty", routes);
app.post("/add_faculty", routes);
app.get('/deletefaculty/:id', routes);
app.get("/api/userfaculty", controller.findfaculty);

app.get("/add_questions", routes);
app.post("/add_questions", routes);
app.get('/deletequestions/:id', routes);
app.get("/api/questions", controller.findquestions);

app.post("/feedbackform", routes);

app.get("/forgot", routes);

app.get("/viewreport", routes);
app.get("/api/feedbacks", controller.findfeedbacks);


app.listen(80, ()=>{
    console.log("connected");
})