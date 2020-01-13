require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const axios = require('axios')
const config = require('./config')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

var port = process.env.PORT || '8080';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

let corsOptions = {
    optionsSuccessStatus: 200,
};

app.get('/', (req, res, next) => {

    let title = req.get('gameTitle');

    let filters = req.get('gameFilters');

    console.log(filters);

    const options = {
        headers: {
            'user-key': config.GAME_API_KEY
        }
    }
    
    axios.post('https://api-v3.igdb.com/games/', `search "${title}"; fields name, platforms; where platforms = [${filters}]; limit 50;`, options)

        .then(function(response) {
            
            res.status(200).send(response.data);

        })
        .catch(error => console.log(error))
})


/* app.get('/', (req, res, next) => {
    fetch('https://api-v3.igdb.com/games', {
        method: 'POST',
        headers: {
            'user-key': process.env.GAME_API_KEY,
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: `search ${req.headers.gameTitle}; fields name; limit 50;`
    })
    .then(res =>
        (!res.ok)
            ? res.send().then(e => Promise.reject(e))
            : res.send('hello')
    )
}) */

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error'} }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app