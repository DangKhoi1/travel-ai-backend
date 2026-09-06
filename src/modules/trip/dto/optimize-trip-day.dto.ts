import { IsInt, Min } from 'class-validator';

export class OptimizeTripDayDto {
  @IsInt()
  @Min(1)
  dayNumber: number;
}
