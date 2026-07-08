import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelPlace } from './entities/travelplace.entity';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';

@Injectable()
export class TravelplaceService {
  constructor(
    @InjectRepository(TravelPlace)
    private readonly travelplaceRepo: Repository<TravelPlace>,
  ) { }


  async create(createTravelplaceDto: CreateTravelplaceDto) {
    try {
      const place = this.travelplaceRepo.create(createTravelplaceDto);
      await this.travelplaceRepo.save(place);
      return {
        EC: 0,
        EM: 'Travelplace created successfully',
        data: place,
      };
    } catch (error: unknown) {
      console.error(
        'Error in create travelplace:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from create travelplace service',
      });
    }
  }

  async findAll() {
    try {
      const places = await this.travelplaceRepo.find();
      return {
        EC: 0,
        EM: 'Travelplaces retrieved successfully',
        data: places,
      };
    } catch (error: unknown) {
      console.error(
        'Error in findAll travelplace:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from findAll travelplace service',
      });
    }
  }

  async findOne(id: string) {
    try {
      const place = await this.travelplaceRepo.findOneBy({ id });
      if (!place) {
        return {
          EC: 1,
          EM: 'Travelplace not found',
          data: null,
        };
      }
      return {
        EC: 0,
        EM: 'Travelplace found',
        data: place,
      };
    } catch (error: unknown) {
      console.error(
        'Error in findOne travelplace:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from findOne travelplace service',
      });
    }
  }

  async update(id: string, updateTravelplaceDto: UpdateTravelplaceDto) {
    try {
      const place = await this.travelplaceRepo.findOneBy({ id });
      if (!place) {
        return {
          EC: 1,
          EM: 'Travelplace not found',
          data: null,
        };
      }
      const updatedPlace = this.travelplaceRepo.merge(
        place,
        updateTravelplaceDto,
      );
      await this.travelplaceRepo.save(updatedPlace);
      return {
        EC: 0,
        EM: 'Travelplace updated successfully',
        data: updatedPlace,
      };
    } catch (error: unknown) {
      console.error(
        'Error in update travelplace:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from update travelplace service',
      });
    }
  }

  async remove(id: string) {
    try {
      const place = await this.travelplaceRepo.findOneBy({ id });
      if (!place) {
        return {
          EC: 1,
          EM: 'Travelplace not found',
          data: null,
        };
      }
      await this.travelplaceRepo.delete(id);
      return {
        EC: 0,
        EM: 'Travelplace deleted successfully',
        data: null,
      };
    } catch (error: unknown) {
      console.error(
        'Error in remove travelplace:',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException({
        EC: 1,
        EM: 'Error from remove travelplace service',
      });
    }
  }
}
