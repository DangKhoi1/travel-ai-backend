import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Travelplace } from './entities/travelplace.entity';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';

@Injectable()
export class TravelplaceService {
  constructor(
    @InjectRepository(Travelplace)
    private readonly travelplaceRepo: Repository<Travelplace>,
  ) {}

  async create(createTravelplaceDto: CreateTravelplaceDto) {
    const place = this.travelplaceRepo.create(createTravelplaceDto);
    await this.travelplaceRepo.save(place);
    return {
      EC: 0,
      EM: 'Travelplace created successfully',
      data: place,
    };
  }

  async findAll() {
    const places = await this.travelplaceRepo.find();
    return {
      EC: 0,
      EM: 'Travelplaces retrieved successfully',
      data: places,
    };
  }

  async findOne(id: string) {
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
  }

  async update(id: string, updateTravelplaceDto: UpdateTravelplaceDto) {
    const place = await this.travelplaceRepo.findOneBy({ id });
    if (!place) {
      return {
        EC: 1,
        EM: 'Travelplace not found',
        data: null,
      };
    }
    const updatedPlace = this.travelplaceRepo.merge(place, updateTravelplaceDto);
    await this.travelplaceRepo.save(updatedPlace);
    return {
      EC: 0,
      EM: 'Travelplace updated successfully',
      data: updatedPlace,
    };
  }

  async remove(id: string) {
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
  }
}
