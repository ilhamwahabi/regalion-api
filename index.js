const express = require('express')

const api = require('./api')
const client = require('./redis')

const app = express()

const port = process.env.PORT || 3000

app.get('/:slug', async (request, response) => {
  try {
    let pokemonData = await new Promise((resolve, reject) =>  {
      client.get(request.params.slug, async (error, result) => {
        if (result) {
          resolve(JSON.parse(result))
        } else {
          const { data } = await api.get(`/${request.params.slug}`)
          client.set(request.params.slug, JSON.stringify(data))
          resolve(data)
        }
      })
    })

    pokemonData = await Promise.all(pokemonData.map(async (pokemon, index) => {
      try {
        const evolutionLine = pokemon.family.evolutionLine
      
        let extraData = evolutionLine.map(async pokemon => {
          try {
            let data = await new Promise((resolve, reject) =>  {
              client.get(request.params.slug, async (error, result) => {
                if (result) {
                  resolve(JSON.parse(result))
                } else {
                  const { data } = await api.get(`/${pokemon}`)
                  client.set(request.params.slug, JSON.stringify(data))
                  resolve(data)
                }
              })
            })

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
          let data = await new Promise((resolve, reject) =>  {
            client.get((parseInt(pokemon.number) - 1).toString(), async (error, result) => {
              if (result) {
                resolve(JSON.parse(result))
              } else {
                const { data } = await api.get(`/${parseInt(pokemon.number) - 1}`)
                client.set((parseInt(pokemon.number) - 1).toString(), JSON.stringify(data))
                resolve(data)
              }
            })
          })
          const { name, number, sprite } = data[0]
          previous = { name, number, sprite }
        }

        let next = {}
        if (parseInt(pokemon.number) < total) {
          let data = await new Promise((resolve, reject) =>  {
            client.get((parseInt(pokemon.number) + 1).toString(), async (error, result) => {
              if (result) {
                resolve(JSON.parse(result))
              } else {
                const { data } = await api.get(`/${parseInt(pokemon.number) + 1}`)
                client.set((parseInt(pokemon.number) + 1).toString(), JSON.stringify(data))
                resolve(data)
              }
            })
          })
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