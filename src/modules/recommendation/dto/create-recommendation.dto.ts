import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRecommendationDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  days?: number;

  @IsString()
  preferences: string;

  @IsString()
  @IsOptional()
  destination?: string;
}
