const crypto = require('crypto')

function encrypt(password, salt = null) {
    !salt && (salt = crypto.randomBytes(16).toString('hex'))

    return {password: crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`), salt}
}

function validateLogin(informedPassword, correctPassowrd, salt) {
    const informedPasswordCrypted = this.encrypt(informedPassword, salt)

    return correctPassowrd === informedPasswordCrypted.password
}

function validateRegister(password) {
    if (password.length < 6) {
        return {status: 'error', message: 'More then 6 characteres required'}
    }

    if (!/[a-z]/.test(password)) {
        return {status: 'error', message: 'One or more lowercase letters required'}
    }

    if (!/[A-Z]/.test(password)) {
        return {status: 'error', message: 'One or more capital letters required'}
    }

    if (!/[0-9]/.test(password)) {
        return {status: 'error', message: 'One or more numbers required'}
    }

    if (!/\W|_/.test(password)) {
        return {status: 'error', message: 'One or more special characters required'}
    }

    return {status: 'success'}
}

module.exports = {
    encrypt,
    validateLogin,
    validateRegister
}