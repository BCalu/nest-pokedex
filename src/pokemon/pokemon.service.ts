import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreatePokemonDto } from "./dto/create-pokemon.dto";
import { UpdatePokemonDto } from "./dto/update-pokemon.dto";
import { Pokemon } from "./entities/pokemon.entity";
import { isValidObjectId, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { PaginationDto } from "../common/dto/pagination.dto";

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configurationService: ConfigService
  ) {
  }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      return await this.pokemonModel.create(createPokemonDto);
    } catch (e) {
      if (e.code === 1100) {
        throw new BadRequestException(`Pokemon already exists in db ${JSON.stringify(e.keyValue)}`);
      }
      console.log(e);
      throw new InternalServerErrorException(`Cant create pokemon check server logs`);
    }
  }

  findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select("-__v");

  }

  async findOne(termn: string) {
    let pokemon: Pokemon;
    if (!isNaN(+termn)) {
      pokemon = await this.pokemonModel.findOne({ no: termn });
    }
    if (!pokemon && isValidObjectId(termn)) {
      pokemon = await this.pokemonModel.findById(termn);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: termn.toLowerCase() });
    }
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${termn}" not found`);
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();
    // return { id };
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`);

    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}
