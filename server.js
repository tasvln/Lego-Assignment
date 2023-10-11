/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Temitope Adebayo Student Student ID: 144000205 Date: 2023-10-10
*
* Published URL: https://curious-fedora-toad.cyclic.cloud/
*
********************************************************************************/

const legoData = require("./modules/legoSets");
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public')); // set static folder

const HTTP_PORT = process.env.PORT || 8080; // set port

// get "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/home.html'));
});

// get "/"
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/about.html'));
});

// get "/lego/sets" to return all sets
app.get('/lego/sets', (req, res) => {
  const theme = req.query.theme;

  if (theme) {
    legoData.getSetsByTheme(theme).then((data) => {
      res.json(data);
    }).catch((err) => {
      res.status(404).json({ message: err });
    });
  } else {
    legoData.getAllSets().then((data) => {
      res.json(data);
    }).catch((err) => {
      res.status(404).json({ message: err });
    });
  }
});

// get "/lego/sets/:id" to return a set by setNum
app.get('/lego/sets/:id', (req, res) => {
  const setNum = req.params.id;

  legoData.getSetByNum(setNum).then((data) => {
    res.json(data);
  }).catch((err) => {
    res.status(404).json({ message: err });
  });
});

// 404 error
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});

// call initialize function in legoData module
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
}).catch((err) => {
  console.log(err);
});