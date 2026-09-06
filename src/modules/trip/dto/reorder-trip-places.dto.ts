import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class TripPlaceOrderDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(1)
  dayNumber: number;

  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderTripPlacesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripPlaceOrderDto)
  items: TripPlaceOrderDto[];
}
