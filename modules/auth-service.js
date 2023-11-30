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
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{
      dateTime: Date,
      userAgent: String
    }]
});

let User;

function initialize() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided (err)or  
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

function registerUser(userData) {
    return new Promise((resolve, reject) => {
      if (userData.password !== userData.password2) {
        reject("Passwords do not match");
      } else {
        bcrypt.hash(userData.password, 10)
          .then((hash) => {
            let newUser = new User({
              userName: userData.userName,
              password: hash,
              email: userData.email,
              loginHistory: []
            });
  
            newUser.save()
              .then(() => {
                resolve();
              })
              .catch((err) => {
                if (err.code === 11000) {
                  reject("User Name already taken");
                } else {
                  reject(`There was an error creating the user: ${err}`);
                }
              });
          })
          .catch((err) => {
            reject(`Error hashing password: ${err}`)
          });
      }
    });
}

function checkUser(userData) {
    return new Promise((resolve, reject) => {
      User.find({ userName: userData.userName })
        .then(users => {
          if (!users) {
            reject(`Unable to find user: ${userData.userName}`);
          } else {
            bcrypt.compare(userData.password, users[0].password)
              .then(result => {
                if (!result) {
                  reject(`Incorrect Password for user: ${userData.userName}`);
                } else {
                  if (users[0].loginHistory.length === 8) {
                    users[0].loginHistory.pop();
                  }
                  users[0].loginHistory.unshift({ dateTime: new Date().toString(), userAgent: userData.userAgent });
  
                  User.updateOne(
                    { 
                        userName: users[0].userName 
                    }, 
                    { 
                        $set: { 
                            loginHistory: users[0].loginHistory 
                        } 
                    })
                    .then(() => {
                        resolve(users[0]);
                    })
                    .catch((err) => {
                        reject(`There was an error verifying the user: ${err}`)
                    });
                }
              })
              .catch((err) => {
                reject(`Error verifying password: ${err}`)
              });
          }
        })
        .catch(() => {
            reject(`Unable to find user: ${userData.userName}`)
        });
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser
};