import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateExpenseDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  transportCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hotelCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  foodCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ticketCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  otherCost?: number;
}
