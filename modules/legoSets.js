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
const Sequelize = require('sequelize');

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

// initialize database
const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log('Connection has been established successfully.');
        resolve();
      })
      .catch((err) => {
        console.log('Unable to connect to the database:', err);
        reject();
      });
  });
};

// get all sets
const getAllSets = () => {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

// get set by setNum
const getSetByNum = (setNum) => {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        set_num: setNum,
      },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject('Unable to find requested set');
        }
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

// get sets by theme
const getSetsByTheme = (theme) => {
  return new Promise((resolve, reject) => {
    Theme.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject('Unable to find requested theme');
        }
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

// add a set
const addSet = (setData) => {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

// get all themes
const getAllThemes = () => {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

// edit a set
const editSet = (setData) => {
  return new Promise((resolve, reject) => {
    Set.update(setData,
      { 
        where: { 
          set_num: setData.set_num 
        } 
      }
    )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

// delete a set
const deleteSet = (setNum) => {
  return new Promise((resolve, reject) => {
    Set.destroy({
      where: {
        set_num: setNum,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}


module.exports = { 
  initialize, 
  getAllSets, 
  getSetByNum, 
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet
}