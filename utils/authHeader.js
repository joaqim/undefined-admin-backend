module.exports = (username, password) =>
    'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')