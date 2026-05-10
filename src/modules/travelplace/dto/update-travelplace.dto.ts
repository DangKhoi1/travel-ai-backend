import { PartialType } from '@nestjs/mapped-types';
import { CreateTravelplaceDto } from './create-travelplace.dto';

export class UpdateTravelplaceDto extends PartialType(CreateTravelplaceDto) {}
