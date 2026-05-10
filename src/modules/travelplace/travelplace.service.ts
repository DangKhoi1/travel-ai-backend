import { Injectable } from '@nestjs/common';
import { CreateTravelplaceDto } from './dto/create-travelplace.dto';
import { UpdateTravelplaceDto } from './dto/update-travelplace.dto';

@Injectable()
export class TravelplaceService {
  create(createTravelplaceDto: CreateTravelplaceDto) {
    return 'This action adds a new travelplace';
  }

  findAll() {
    return `This action returns all travelplace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} travelplace`;
  }

  update(id: number, updateTravelplaceDto: UpdateTravelplaceDto) {
    return `This action updates a #${id} travelplace`;
  }

  remove(id: number) {
    return `This action removes a #${id} travelplace`;
  }
}
