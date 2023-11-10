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
const Sequelize = require('sequelize');

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

// initialize sequelize
let db = process.env.PGDATABASE;
let host = process.env.PGHOST;
let user = process.env.PGUSER;
let password = process.env.PGPASSWORD;

let sequelize = new Sequelize(db, user, password, {
  host: host,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const Set = sequelize.define('Set', {
  set_num: {
    Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// call initialize function in legoData module
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
}).catch((err) => {
  console.log(err);
});