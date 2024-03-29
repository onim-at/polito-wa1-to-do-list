import Task from "./task.js";

const APIURL = 'http://localhost:3000/api';
async function getTasks(filter, csrfToken, id) {
    let url = APIURL + "/tasks";
    if (filter) {
        const queryParams = "?filter=" + filter;
        url += queryParams;
    }
    if(id){
        const userId = "&userId=" + id;
        url += userId;
    }
    const response = await fetch(url, {
        method: 'GET', headers: {
            'X-CSRF-Token': csrfToken,
        },
    });
    const tasksJson = await response.json();
    if (response.ok) {
        return tasksJson.map((t) => Task.from(t));
    } else {
        throw tasksJson;  // An object with the error coming from the server
    }
}

async function addTask(task, csrfToken, userId) {
    return new Promise((resolve, reject) => {
        fetch(APIURL + '/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify({...task, userId: userId}),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then((data) => resolve(data));
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function updateTask(task, csrfToken) {
    return new Promise((resolve, reject) => {
        fetch(APIURL + '/tasks/' + task.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify(task),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function deleteTask(taskId, csrfToken) {
    return new Promise((resolve, reject) => {
        fetch(APIURL + '/tasks/' + taskId, {
            method: 'DELETE',
            headers: {
                'X-CSRF-Token': csrfToken,
            },
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}


// User authentication
async function userLogin(username, password) {
    return new Promise((resolve, reject) => {
        fetch(APIURL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password }),
        }).then((response) => {
            if (response.ok) {
                response.json()
                    .then((obj) => { resolve(obj); })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function getCSRFToken() {
    return new Promise((resolve, reject) => {
        fetch(APIURL + '/csrf-token').then((response) => {
            if (response.ok) {
                response.json()
                    .then((obj) => { resolve(obj); })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function userLogout() {
    return new Promise((resolve, reject) => {
        fetch(APIURL + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                reject(null);
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}



export { getTasks, addTask, deleteTask, updateTask, userLogin, getCSRFToken, userLogout };