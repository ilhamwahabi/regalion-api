const express = require('express')

const api = require('./api')
const client = require('./redis')

const app = express()

const port = process.env.PORT || 8000

const getPokemonData = (nameOrNumber) => {
  return new Promise((resolve, reject) =>  {
    client.get(nameOrNumber, async (error, result) => {
      if (result) {
        resolve(JSON.parse(result))
      } else {
        if (nameOrNumber !== 'favicon.ico') {
          const { data } = await api.get(`/${nameOrNumber}`)
          client.set(nameOrNumber, JSON.stringify(data))
          resolve(data)
        }
      }
    })
  })
}

app.get('/:slug', async (request, response) => {
  try {
    let pokemonData = await getPokemonData(request.params.slug)

    pokemonData = await Promise.all(pokemonData.map(async (pokemon, index) => {
      try {
        const evolutionLine = pokemon.family.evolutionLine
      
        let extraData = evolutionLine.map(async pokemonName => {
          try {
            let data = await getPokemonData(pokemonName.toLowerCase())
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
          let data = await getPokemonData((parseInt(pokemon.number) - 1).toString())
          const { name, number, sprite } = data[0]
          previous = { name, number, sprite }
        }

        let next = {}
        if (parseInt(pokemon.number) < total) {
          let data = await getPokemonData((parseInt(pokemon.number) + 1).toString())
          const { name, number, sprite } = data[0]
          next = { name, number, sprite }
        }

        const family = { ...pokemon.family, evolutionLine: extraData }
        return { ...pokemon, family, previous, next } 
      } catch (error) {
        throw new Error('Error when update pokemon family data')
      }
    }))
  
    response.send(pokemonData)
  } catch (error) {
    throw new Error('Error when return pokemon data ' + error)
  }
})

app.listen(port, () => {
  console.log(`App is listening at port ${port}`)
})