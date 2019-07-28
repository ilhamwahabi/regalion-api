const express = require("express");
const cors = require("cors");
const Vibrant = require("node-vibrant");

const api = require("./api");
const client = require("./redis");

const app = express();

app.use(cors());

const port = process.env.PORT || 8000;

// Get pokemon data from API or from redis if already fetched
const getPokemonData = nameOrNumber => {
  return new Promise((resolve, reject) => {
    client.get(nameOrNumber, async (error, result) => {
      if (result) {
        resolve(JSON.parse(result));
      } else {
        if (nameOrNumber !== "favicon.ico") {
          const { data } = await api.get(`/${nameOrNumber}`);
          client.set(nameOrNumber, JSON.stringify(data));
          resolve(data);
        }
      }
    });
  });
};

app.get("/:slug", async (request, response) => {
  try {
    let pokemonData = await getPokemonData(request.params.slug);

    pokemonData = await Promise.all(
      pokemonData.map(async (pokemon, index) => {
        try {
          const evolutionLine = pokemon.family.evolutionLine;

          let extraData = evolutionLine.map(async pokemonName => {
            try {
              let data = await getPokemonData(pokemonName.toLowerCase());
              const { name, number, sprite } = data[index]
                ? data[index]
                : data[0];
              return { name, number, sprite };
            } catch (error) {
              throw new Error("Error when fetching evolution line data");
            }
          });

          extraData = await Promise.all(extraData);

          // Get Pokemon color palettes from sprite
          const vibrantPalettes = await Vibrant.from(
            pokemon.sprite
          ).getPalette();

          const palettes = {
            normal: vibrantPalettes.Vibrant._rgb.join(),
            dark: vibrantPalettes.DarkVibrant._rgb.join(),
            light: vibrantPalettes.LightVibrant._rgb.join()
          };

          // Get total pokemon
          const {
            data: { total }
          } = await api.get("/counts");

          // Get some data of previous Pokemon (for previous button)
          let previous = {};
          if (parseInt(pokemon.number) > 1) {
            let data = await getPokemonData(
              (parseInt(pokemon.number) - 1).toString()
            );
            const { name, number, sprite } = data[0];
            previous = { name, number, sprite };
          }

          // Get some data of next Pokemon (for next button)
          let next = {};
          if (parseInt(pokemon.number) < total) {
            let data = await getPokemonData(
              (parseInt(pokemon.number) + 1).toString()
            );
            const { name, number, sprite } = data[0];
            next = { name, number, sprite };
          }

          const family = { ...pokemon.family, evolutionLine: extraData };
          return { ...pokemon, palettes, family, previous, next };
        } catch (error) {
          throw new Error("Error when update pokemon family data");
        }
      })
    );

    response.send(pokemonData);
  } catch (error) {
    throw new Error("Error when return pokemon data " + error);
  }
});

app.listen(port, () => {
  console.log(`App is listening at port ${port}`);
});
