const express = require('express')

const app = express()

const port = process.env.PORT || 3000

app.get('/:slug', (request, response) => {
  response.send(request.params.slug)
})

app.listen(port, () => {
  console.log(`App is listening at port ${port}`)
})