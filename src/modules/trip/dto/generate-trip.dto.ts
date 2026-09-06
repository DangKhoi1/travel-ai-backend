import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GenerateTripDto {
  @IsString()
  destination: string;

  @IsInt()
  @Min(1)
  @Max(14)
  days: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  preferences?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;
}
