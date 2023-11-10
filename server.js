/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Temitope Adebayo Student Student ID: 144000205 Date: 2023-11-09
*
* Published URL: https://curious-fedora-toad.cyclic.cloud/
*
********************************************************************************/

require('dotenv').config();
const legoData = require("./modules/legoSets");
const express = require('express');
const path = require('path');
const app = express();

// set static folder
app.use(express.static('public'));

// set view engine
app.set('view engine', 'ejs');

// set port
const HTTP_PORT = process.env.PORT || 8080;

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

// 404 error
app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

// call initialize function in legoData module
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
}).catch((err) => {
  console.log(err);
});