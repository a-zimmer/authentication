const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

const token = require('./login/token')
const account = require('./account')

const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', token.verify, (req, res) => {
    res.json({message: "All it's fine!"})
})

app.get('/accounts', token.verify, async (req, res) => {
    res.json(await account.get(req.query))
})

app.delete('/accounts', token.verify, async (req, res) => {
    res.json(await account.drop(req.body))
})

app.post('/accounts', async (req, res) => {
    res.json(await account.register(req.body))
})

app.put('/accounts/password', token.verify, async (req, res) => {
    res.json(await account.changePassword(req.body))
})

app.put('/accounts/email', token.verify, async (req, res) => {
    res.json(await account.changeEmail(req.body))
})

app.post('/login', async (req, res) => {
    const user = await account.verify(req.body)
    if (user) {
        account.setLastLogin(user)
        return res.json({ auth: true, token: token.generate(user), expiresIn: `${process.env.SECRET_EXPIRATION_TIME || 3600} seconds` })
    }
    res.status(500).json({message: 'Invalid credentials!'})
})

app.post('/logout', function(req, res) {
    res.json({ auth: false, token: null })
})

const server = http.createServer(app); 
server.listen(3000);
console.log("Server listen on port 3000...")