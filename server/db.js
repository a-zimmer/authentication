require("dotenv-safe").config()
const { Client } = require('pg')

async function executeQuery(query, params = []) {
    const client = new Client({
        connectionString: `postgres://postgres:${process.env.PG_USER}@${process.env.PG_LOCATION}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`
    })

    client.connect()
    return new Promise((resolve, reject) => {
        client.query(query, params)
            .then(result => resolve(result))
            .catch(error => reject(error))
            .then(() => client.end())
    })
}

function whereAnd(filters) {
    return !filters || !filters.length ? "where" : "and"
}

module.exports = {
    executeQuery,
    whereAnd
};