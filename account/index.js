const Password = require('./password')
const db = require('../server/db')

async function register(params) {
    let result = []
    for (let param of params) {
        let data = {status: 'success'}
        try {
            await validateParams(param)

            await db.executeQuery("insert into account (login, password, email, salt) values ($1, $2, $3, $4) returning id", prepareRegister(param))
                .then(result => data.id = result.rows[0] && result.rows[0].id)
                .catch(() => data.status = 'error')

            if (data.status === 'error') {
                throw new Error("Error registering account")
            }

            result.push({status: 'success', message: `Account ${param.login} registered`, data: {id: data.id}})
        } catch (e) {
            result.push({status: 'error', message: e.message, data: param})
        }
    }
        
    return result
}

async function drop(params) {
    let result, ids = params.map(item => item.id)

    if (!ids || !ids.length) {
        throw new Error("One or more id is required.");
    }

    await db.executeQuery("delete from account where id in ($1)", [ids.join(', ')])
        .then(result => result = {status: 'success', 'rows': result.rowCount})
        .catch(() => result = {status: 'error'})

    return result
}

async function verify(params) {
    let registeredAccount = {}
    await db.executeQuery("select id, login, password, email, salt from account where login = $1", [params.login])
        .then(result => registeredAccount = result.rows)

    if (!registeredAccount || !registeredAccount[0]) {
        return false
    }
    
    return (Password.validateLogin(params.password, registeredAccount[0].password, registeredAccount[0].salt) && registeredAccount[0].id)
}

async function get(params) {
    if (!params) {
        return []
    }

    let result = {}
    await db.executeQuery(`
        select
            id,
            login,
            email,
            to_char(created_on, 'DD/MM/YYYY HH24:MI:SS') created_on,
            to_char(last_login, 'DD/MM/YYYY HH24:MI:SS') last_login
        from account
        ${prepareGet(params)}
    `).then(data => result = data.rows)

    return result
}

async function setLastLogin(id) {
    await db.executeQuery("update account set last_login = now() where id = $1", [id])
}

async function changePassword(params) {
    let result = [], status = 'success'
    try {
        const validPassword = Password.validateRegister(params.password)
        if (validPassword.status !== 'success') {
            throw new Error(validPassword.message)
        }
        
        const password = Password.encrypt(params.password)
        await db.executeQuery("update account set password = $1, salt = $2 where id = $3", [password.password, password.salt, params.id])
            .catch(() => status = 'error')

        if (status === 'error') {
            throw new Error("Error changing password")
        }

        result.push({status: 'success', message: `Password updated`})
    } catch (e) {
        result.push({status: 'error', message: e.message, data: params})
    }

    return result
}

async function changeEmail(params) {
    let result = [], status = 'success'
    try {
        await db.executeQuery("update account set email = $1 where id = $2", [params.email, params.id])
            .catch(() => status = 'error')

        if (status === 'error') {
            throw new Error("Error changing email")
        }

        result.push({status: 'success', message: `Email updated`})
    } catch (e) {
        result.push({status: 'error', message: e.message, data: params})
    }

    return result
}

function prepareRegister(param) {
    const password = Password.encrypt(param.password)

    return [
        param.login,
        password.password,
        param.email,
        password.salt
    ];
}

function prepareGet(params) {
    let filter = ''
    if (params.id) {
        filter += `${db.whereAnd(filter)} id = ${params.id}`
    }

    if (params.login) {
        filter += `${db.whereAnd(filter)} login ilike '%${params.login}%'`
    }

    if (params.email) {
        filter += `${db.whereAnd(filter)} email ilike '%${params.email}%'`
    }

    return filter
}

async function validateParams(params) {
    let existsLogin = false, existsEmail = false
    await db.executeQuery("select id from account where login = $1", [params.login])
        .then(result => existsLogin = result.rows[0] && result.rows[0].id)

    if (existsLogin) {
        throw new Error('Login already registered')
    }

    await db.executeQuery("select id from account where email = $1", [params.email])
        .then(result => existsEmail = result.rows[0] && result.rows[0].id)

    if (existsEmail) {
        throw new Error('Email already registered')
    }

    if (!params.login) {
        throw new Error('Login is required')
    }

    if (!params.password) {
        throw new Error('Password is required')
    }

    const validPassword = Password.validateRegister(params.password)
    if (validPassword.status !== 'success') {
        throw new Error(validPassword.message)
    }

    if (!params.email) {
        throw new Error('Email is required')
    }
}

module.exports = {
    register,
    drop,
    verify,
    get,
    setLastLogin,
    changePassword,
    changeEmail
}