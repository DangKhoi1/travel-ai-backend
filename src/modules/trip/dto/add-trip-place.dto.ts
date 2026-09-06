import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddTripPlaceDto {
  @IsUUID()
  placeId: string;

  @IsInt()
  @Min(1)
  dayNumber: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @IsString()
  @IsOptional()
  estimatedDuration?: string;
}
