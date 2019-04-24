const express = require('express')

const api = require('./api')

const app = express()

const port = process.env.PORT || 3000

app.get('/:slug', async (request, response) => {
  const { data } = await api.get(`/${request.params.slug}`)

  response.send(data)
})

app.listen(port, () => {
  console.log(`App is listening at port ${port}`)
})