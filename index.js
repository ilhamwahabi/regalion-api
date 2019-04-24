const express = require('express')
const axios = require('axios')

const app = express()

const port = process.env.PORT || 3000

app.get('/:slug', async (request, response) => {
  const { data } = await axios.get(`https://pokeapi.glitch.me/v1/pokemon/${request.params.slug}`, {
    Headers: {
      'User-Agent': 'Regalion (http://regalion.surge.sh, v1.0.0)'
    }
  })

  response.send({ data })
})

app.listen(port, () => {
  console.log(`App is listening at port ${port}`)
})