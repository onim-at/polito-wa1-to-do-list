'use strict'
const bcrypt = require('bcrypt');
const Task = require('./task');
const db = require('./db');
const moment = require('moment');

/**
 * Function to create a Task object from a row of the tasks table
 * @param {*} row a row of the tasks table
 */
const createTask = function (row) {
    const importantTask = (row.important === 1) ? true : false;
    const privateTask = (row.private === 1) ? true : false;
    const completedTask = (row.completed === 1) ? true : false;
    return new Task(row.id, row.description, importantTask, privateTask, moment.utc(row.deadline), row.project, completedTask);
}

/**
* Function to check if a date is today. Returns true if the date is today, false otherwise.
* @param {*} date a Moment js date to be checked
*/
const isToday = function (date) {
    console.log(date)
    console.log(moment())
    return date.isSame(moment(), 'day');
}

/**
* Function to check if a date is in the next week. Returns true if the date is in the next week, false otherwise.
* @param {*} date a Moment js Date to be checked
*/
const isNextWeek = function (date) {
    const nextWeek = moment().add(1, 'weeks');
    const tomorrow = moment().add(1, 'days');
    return date.isAfter(tomorrow) && date.isBefore(nextWeek);
}

/**
 * Get tasks and optionally filter them
 */
exports.getTasks = function (filter, userId) {
        return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tasks WHERE userId = ?";
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let tasks = rows.map((row) => createTask(row));
                if (filter) {
                    switch (filter) {
                        case "important":
                            tasks = tasks.filter((el) => {
                                return el.important;
                            });
                            break;
                        case "private":
                            tasks = tasks.filter((el) => {
                                return el.privateTask;
                            });
                            break;
                        case "shared":
                            tasks = tasks.filter((el) => {
                                return !el.privateTask;
                            });
                            break;
                        case "today":
                            tasks = tasks.filter((el) => {
                                if (el.deadline)
                                    return isToday(el.deadline);
                                else
                                    return false;
                            });
                            break;
                        case "week":
                            tasks = tasks.filter((el) => {
                                if (el.deadline)
                                    return isNextWeek(el.deadline);
                                else
                                    return false;
                            });
                            break;
                        case "all":
                            break;
                        default:
                            //try to filter by project
                            tasks = tasks.filter((el) => {
                                return el.project === filter;
                            });
                    }
                }
                resolve(tasks);
            }
        });
    });
}

/**
 * Get a task with given 
 */
exports.getTask = function (id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tasks WHERE id = ?";
        db.all(sql, [id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                const task = createTask(rows[0]);
                resolve(task);
            }
        });
    });
}

/**
 * Delete a task with a given id
 */
exports.deleteTask = function (id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        db.run(sql, [id], (err) => {
            if (err)
                reject(err);
            else
                resolve(true);
        })
    });
}

/**
 * Insert a task in the database and returns the id of the inserted task. 
 * To get the id, this.lastID is used. To use the "this", db.run uses "function (err)" instead of an arrow function.
 */
exports.createTask = function (task) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO tasks(description, important, private, project, deadline, completed, userId) VALUES(?,?,?,?,DATETIME(?),?,?)';
        db.run(sql, [task.description, task.important, task.privateTask, task.project, task.deadline, task.completed, task.userId], function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(this.lastID);
                resolve(this.lastID);
            }
        });
    });
}

/**
 * Update an existing task with a given id. newTask contains the new values of the task (e.g., to mark it as "completed")
 */
exports.updateTask = function (id, newTask) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE tasks SET description = ?, important = ?, private = ?, project = ?, deadline = DATETIME(?), completed = ? WHERE id = ?';
        db.run(sql, [newTask.description, newTask.important, newTask.privateTask, newTask.project, newTask.deadline, newTask.completed, id], (err) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else
                resolve(null);
        })
    });
}


/**
 * Check if user - password is valid
 */
exports.checkUserPass = function (user, pass) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, name, email, hash FROM user WHERE name = ?';
      // execute query and get all results into `rows`
      db.all(sql, [user], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        if (rows.length === 0) {
          reject(null);
          return;
        }
        const passwordHashDb = rows[0].hash;
        console.log(rows)
        // bcrypt.compare might be computationally heavy, thus it call a callback function when completed
        bcrypt.compare(pass, passwordHashDb, function (err, res) {
          if (err)
            reject(err);
          else {
            if (res) {
              resolve({
                id: rows[0].id,
                name: rows[0].name,
              });
              return;
            } else {
              reject(null);
              return;
            }
          }
        });
      });
    });
  }