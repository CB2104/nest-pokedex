import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    const operations = data.results.map(({ name, url }) => {
      const no = Number(
        new URL(url).pathname.split('/').filter(Boolean).at(-1),
      );

      return {
        updateOne: {
          filter: { no },
          update: {
            $set: { name, no },
          },
          upsert: true,
        },
      };
    });

    const result = await this.pokemonModel.bulkWrite(operations, {
      ordered: false,
    });

    return `SEED Executed
      total: ${operations.length},
      inserted: ${result.upsertedCount},
      updated: ${result.modifiedCount},
    `;
  }
  // async executeSeed() {
  //   await this.pokemonModel.deleteMany({});

  //   const { data } = await this.axios.get<PokeResponse>(
  //     'https://pokeapi.co/api/v2/pokemon?limit=10',
  //   );

  //   const pokemonToInsert: { name: string; no: number } = [];

  //   data.results.forEach(async ({ name, url }) => {
  //     const segments = url.split('/');
  //     const no: number = +segments[segments.length - 2];

  //     const pokemon = await this.pokemonModel.create({ name, no });
  //     pokemonToInsert.push({ name, no });
  //   });

  //   await this.pokemonModel.insertMany(pokemonToInsert);

  //   return 'SEED Executed';
  // }
}
