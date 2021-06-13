const express = require("express");
const routes = express.Router();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const user = require('./modle.js');
const Student_List = require('./modelstudent.js');
const Facultys_List = require('./modelfaculty.js');
const Questions_List = require('./modelquestions.js');
const Feedback_Form = require('./modelfeedbackform.js')
const passport = require('passport');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const flash = require('connect-flash');
const { ensureAuthenticated } = require('./auth');
const controller = require('./controller');
const axios = require('axios');




routes.use(bodyparser.urlencoded({ extended: true }));

routes.use(cookieparser('secret'));
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));


routes.use(passport.initialize());
routes.use(passport.session());


routes.use(flash());
routes.use((req, res, next) => {
    res.locals.successmessage = req.flash('successmessage');
    res.locals.errormessage = req.flash('errormessage');
    res.locals.error = req.flash('error');
    next();

});


// database connection start===================================================================================================

mongoose.connect('mongodb://localhost/Database', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("connected");
});



// const register = mongoose.model('Contact', registerSchema);
// database connection end=====================================================================================================


// for registration============================================================================================================
routes.get("/", (req, res) => {
    res.render("register");
});

routes.post("/register", (req, res) => {
    var { email, username, password, confirmpassword } = req.body;
    // res.render("login");
    var err;
    if (!username || !email || !password || !confirmpassword) {
        err = "Fill the all feilds";
        res.render("register", { 'err': err });
    }
    else if (password != confirmpassword) {
        err = "pwd don't match";
        res.render("register", { 'err': err, 'username': username, 'email': email });
    }
    if (typeof err == 'undefined') {
        user.findOne({ email: email }, (err, data) => {
            if (err) throw err;
            if (data) {
                console.log("user exists");
                err = "user already taken this email";
                res.render("register", { 'err': err, 'username': username, 'email': email });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                            username, email, password
                        }).save((err, data) => {
                            if (err) throw err;
                            req.flash('successmessage', "succesfully registerd, log in to continue")
                            res.redirect('/login')
                        });
                    });
                });
            }
        });
    }
});

// registration end========================================================================================================

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    user.findOne({ email: email }, (err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false, { message: "user does't exists...." });
        }
        bcrypt.compare(password, data.password, (err, match) => {
            if (err) {
                return done(null, false);
            }
            else if (!match) {
                return done(null, false, { message: "password does't match...." });
            }
            else if (match) {
                return done(null, data);
            }
        });
    });
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
})

passport.deserializeUser((id, cb) => {
    user.findById(id, (err, user) => {
        cb(err, user);
    });
});



routes.get('/login', (req, res) => {
    res.render('login')
});

routes.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/home',
        failureFlash: true,
    })(req, res, next);
});

routes.get('/home', ensureAuthenticated, (req, res) => {
    // res.render('home',{Username: req.user.username})
    let one = "http://localhost/api/users"
    let two = "http://localhost/api/userfaculty"
    let three = "http://localhost/api/questions"

    const requestOne = axios.get(one);
    const requestTwo = axios.get(two);
    const requestThree = axios.get(three);

    axios.all([requestOne, requestTwo, requestThree]).then(axios.spread((...responses) => {
        const responseOne = responses[0]
        const responseTwo = responses[1]
        const responesThree = responses[2]
        res.render('home', { users: responseOne.data, Username: req.user.username, userfaculty:responseTwo.data, ques:responesThree.data}); 
      })).catch(err => {
        res.send(err);
    })
});

routes.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
})

// routes.get('/index', (req, res) => {
//     axios.get('http://localhost/api/users')
//         .then(function(response){
//             res.render('index', { users : response.data });
//         })
//         .catch(err =>{
//             res.send(err);
//         })
// });


//  this is for student list oprations============================================

routes.get('/add_user', (req, res) => {
    res.render('add_user')
});


routes.post('/add_user', (req, res) => {
    var myData = new Student_List(req.body)
    myData.save()
    res.render('add_user')
})



routes.get('/delete/:id', (req, res, next) => {
    Student_List.findByIdAndDelete({ _id: req.params.id }, (err, docs) => {
        if (err) {
            console.log("someting went wrong")
        } else {
            console.log("Student deleted Successfully.......");
        }
    })
})


// this is for faculty list operation ===================================

routes.get('/add_faculty', (req, res) => {
    res.render('add_faculty')
});


routes.post('/add_faculty', (req, res) => {
    var myData = new Facultys_List(req.body)
    myData.save()
    res.render('add_faculty')
})

routes.get('/deletefaculty/:id', (req, res, next) => {
    Facultys_List.findByIdAndDelete({ _id: req.params.id }, (err, docs) => {
        if (err) {
            console.log("someting went wrong")
        } else {
            console.log("Faculty deleted Successfully.......");
        }
    })
})

// this is for question list operation==========================================

routes.get('/add_questions', (req, res) => {
    res.render('add_questions')
});


routes.post('/add_questions', (req, res) => {
    var myData = new Questions_List(req.body)
    myData.save()
    res.render('add_questions')
})


routes.get('/deletequestions/:id', (req, res, next) => {
    Questions_List.findByIdAndDelete({ _id: req.params.id }, (err, docs) => {
        if (err) {
            console.log("someting went wrong")
        } else {
            console.log("Question deleted Successfully.......");
        }
    })
})


// for student pannel
routes.post('/feedbackform', (req, res) => {
    var myData = new Feedback_Form(req.body)
    myData.save()
})


// for forgot your password 

routes.get('/forgot', (req, res) => {
    res.render('forgot')
});

// for view report

routes.get('/viewreport',(req, res)=> {
    // res.render('home',{Username: req.user.username})
    axios.get("http://localhost/api/questions")
    .then(function(response){
        res.render('viewreport',{allfeedback:response.data})
    }).catch(err=>{
        res.send(err)
    })
});

module.exports = routes;