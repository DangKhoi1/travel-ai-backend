import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  days?: number;

  @IsString()
  @IsOptional()
  preferences?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
