/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Temitope Adebayo Student Student ID: 144000205 Date: 2023-09-26
*
********************************************************************************/


require('dotenv').config();
const Sequelize = require('sequelize');

const initialize = () => {
  return sequelize.sync()
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log(error);
    });
};

const getAllSets = () => {
  // return promise of sets
  const sets = Set.findAll({ include: [Theme] });
  return sets;
};

const getSetByNum = (setNum) => {
  // find set by setNum
  const set = Set.findAll({
    include: [Theme],
    where: { 
      set_num: setNum 
    },
  }).then((sets) => {
    // check if set exists
    if (sets.length > 0) {
      return sets[0];
    } else {
      throw new Error('Unable to find requested set');
    }
  });

  return set;
};

const getSetsByTheme = (theme) => {
  const sets = Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  }).then((sets) => {
    // check if sets exists
    if (sets.length > 0) {
      return sets;
    } else {
      throw new Error('Unable to find requested sets');
    }
  });

  return sets;
};

module.exports = { 
  initialize, 
  getAllSets, 
  getSetByNum, 
  getSetsByTheme 
}

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
    type: Sequelize.STRING,
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