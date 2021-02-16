require("dotenv-safe").config()

const jwt = require('jsonwebtoken')

function generate(id) {
    const expirationTime = parseInt(process.env.SECRET_EXPIRATION_TIME || 3600)
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: expirationTime
    })
}

function verify(req, res, next) {
    const token = req.headers['x-access-token']
    if (!token) {
        return res.status(401).json({ auth: false, message: 'No token provided.' })
    }

    jwt.verify(token, process.env.SECRET, (error, decoded) => {
        if (error) {
            return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' })
        }

        req.userId = decoded.id
        next && next()
    })
}

module.exports = {
    generate,
    verify
};