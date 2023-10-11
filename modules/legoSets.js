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

const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

const initialize = () => {
  // add theme name to each set
  const newSets = setData.map((set) => {
    const theme = themeData.find((theme) => theme.id === set.theme_id);
    return { ...set, theme: theme.name };
  });

  // return promise of newSets
  return new Promise((resolve, reject) => {
    sets = newSets;

    // return an empty resolve
    sets.length > 0 ? resolve() : reject("Unable to read data");
  });
};

const getAllSets = () => {
  // return promise of sets
  return new Promise((resolve, reject) => {
    sets.length > 0 ? resolve(sets) : reject("No sets found");
  });
};

const getSetByNum = (setNum) => {
  // find set by setNum
  const set = sets.find((set) => set.set_num === setNum);

  // return promise of set
  return new Promise((resolve, reject) => {
    set ? resolve(set) : reject("Unable to find requested set");
  });
};

const getSetsByTheme = (theme) => {
  // convert theme to lowercase
  const input = theme.toLowerCase();

  // filter sets by theme
  const set = sets.filter((set) => set.theme.toLowerCase().includes(input));

  // return promise of set
  return new Promise((resolve, reject) => {
    set.length > 0 ? resolve(set) : reject("Unable to find requested sets");
  });
};

module.exports = { 
  initialize, 
  getAllSets, 
  getSetByNum, 
  getSetsByTheme 
}