const axios = require('axios')

const api = axios.create({
  baseURL: 'https://pokeapi.glitch.me/v1/pokemon',
  Headers: {
    'User-Agent': 'Regalion (http://regalion.surge.sh, v1.0.0)'
  }
})

module.exports = api