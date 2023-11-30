/********************************************************************************
* WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Temitope Adebayo Student Student ID: 144000205 Date: 2023-11-30
*
* Published URL: https://curious-fedora-toad.cyclic.cloud/
*
********************************************************************************/

require('dotenv').config();
const legoData = require("./modules/legoSets");
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');
const express = require('express');
const app = express();

// set static folder
app.use(express.static('public'));

// configure client-sessions
app.use(
  clientSessions({
    cookieName: 'session',
    secret: 'DhNay7wgoHmRsz0AyLVtFdMDqSrJTaMr',
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

// middleware to add session to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// set view engine
app.set('view engine', 'ejs');

// urlencoded middleware
app.use(express.urlencoded({ extended: true }));

// set port
const HTTP_PORT = process.env.PORT || 8080;

// middleware to ensure user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// get "/"
app.get('/', (req, res) => {
  res.render('home');
});

// get "/"
app.get('/about', (req, res) => {
  res.render('about');
});

// get "/lego/sets" to return all sets
app.get('/lego/sets', (req, res) => {
  const theme = req.query.theme;

  if (theme) {
    legoData.getSetsByTheme(theme).then((data) => {
      res.render('sets', { sets: data });
    }).catch((err) => {
      res.status(404).render("404", {message: "Unable to find requested sets."});
    });
  } else {
    legoData.getAllSets().then((data) => {
      res.render('sets', { sets: data });
    }).catch((err) => {
      res.status(404).render("404", {message: "Unable to find requested sets."});
    });
  }
});

// get "/lego/sets/:id" to return a set by setNum
app.get('/lego/sets/:id', (req, res) => {
  const setNum = req.params.id;

  legoData.getSetByNum(setNum).then((data) => {
    res.render('set', { set: data });
  }).catch((err) => {
    res.status(404).render("404", {message: "Unable to find requested set."});
  });
});

// get "/lego/addSet" to return a form to add a set
app.get('/lego/addSet', ensureLogin, (req, res) => {
  legoData.getAllThemes().then((data) => {
    res.render('addSet', { themes: data });
  }).catch((err) => {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

// post "/lego/addSet" to add a set
app.post('/lego/addSet', ensureLogin, (req, res) => {
  legoData.addSet(req.body).then(() => {
    res.redirect('/lego/sets');
  }).catch((err) => {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

// get "/lego/editSet/:id" to return a form to edit a set
app.get('/lego/editSet/:num', ensureLogin, (req, res) => {
  const setNum = req.params.num;

  legoData.getSetByNum(setNum).then((data) => {
    legoData.getAllThemes().then((themes) => {
      res.render('editSet', { set: data, themes: themes });
    }).catch((err) => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
  }).catch((err) => {
    res.status(404).render("404", {message: "Unable to find requested set."});
  });
});

// post "/lego/editSet" to edit a set
app.post('/lego/editSet', ensureLogin, (req, res) => {
  legoData.editSet(req.body).then(() => {
    res.redirect('/lego/sets');
  }).catch((err) => {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

// get "/lego/deleteSet/:num" to delete a set
app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
  const setNum = req.params.num;

  legoData.deleteSet(setNum).then(() => {
    res.redirect('/lego/sets');
  }).catch((err) => {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

// get "/register" to return a form to register a user
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

// post "/login" to login a user
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            }
            res.redirect('/lego/sets');
        })
        .catch((err) => {
            res.render('login', { errorMessage: err, userName: req.body.userName });
        });
});

// get "/register" to return a form to register a user
app.get('/register', (req, res) => {
  res.render('register', { errorMessage: null });
});

// post "/register" to register a user
app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: "User created" });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err, userName: req.body.userName, email: req.body.email });
    });
});

// get "/logout" to logout a user
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

// get "/userHistory" to return a user's login history
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});

// 404 error
app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

// call initialize the auth service, database and then start the server
legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
    }).catch((err) => {
        console.log(err);
    });