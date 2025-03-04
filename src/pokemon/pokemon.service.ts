import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemomModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemomn = await this.pokemomModel.create(createPokemonDto);
      return pokemomn;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    let pokemon:Pokemon

    if(!isNaN(+id)) {
      pokemon = await this.pokemomModel.findOne({no: id});
    }

    // MongoID
    if(!pokemon && isValidObjectId(id)){
      pokemon = await this.pokemomModel.findById(id);
    }

    // Name
    if(!pokemon){
      pokemon = await this.pokemomModel.findOne({name: id.toLowerCase().trim()});
    }

    if(!pokemon) throw new BadRequestException(`Pokemon with id, name or no "${id}" not found`);

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(id);

    if(updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, {new: true}); //new te regresa el nuevo objeto
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = await this.pokemomModel.findByIdAndDelete({_id: id});
    const result = await this.pokemomModel.deleteOne({_id: id});
    if(result.deletedCount === 0) throw new BadRequestException(`Pokemon with id "${id}" not found`);
    return {result};
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Pokemon not created`);
  }
}
