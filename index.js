const express = require('express')

const api = require('./api')

const app = express()

const port = process.env.PORT || 3000

app.get('/:slug', async (request, response) => {
  try {
    let { data } = await api.get(`/${request.params.slug}`)

    data = await Promise.all(data.map(async (pokemon, index) => {
      try {
        const evolutionLine = pokemon.family.evolutionLine
      
        let extraData = evolutionLine.map(async pokemon => {
          try {
            const { data } = await api.get(`/${pokemon}`)
            const { name, number, sprite } = data[index] ? data[index] : data[0]
      
            return { name, number, sprite }
          } catch (error) {
            throw new Error('Error when fetching evolution line data')
          }
        })
    
        extraData = await Promise.all(extraData)

        const { data: { total } } = await api.get('/counts')

        let previous = {}
        if (parseInt(pokemon.number) > 1) {
          const { data } = await api.get(`/${parseInt(pokemon.number) - 1}`)
          const { name, number, sprite } = data[0]
          previous = { name, number, sprite }
        }

        let next = {}
        if (parseInt(pokemon.number) < total) {
          const { data } = await api.get(`/${parseInt(pokemon.number) + 1}`)
          const { name, number, sprite } = data[0]
          next = { name, number, sprite }
        }

        const family = { ...pokemon.family, evolutionLine: extraData }
        return { ...pokemon, family, previous, next } 
      } catch (error) {
        throw new Error('Error when update pokemon family data')
      }
    }))
  
    response.send(data)
  } catch (error) {
    throw new Error('Error when return pokemon data ' + error)
  }
})

app.listen(port, () => {
  console.log(`App is listening at port ${port}`)
})