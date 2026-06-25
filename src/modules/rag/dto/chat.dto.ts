import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  topK?: number = 3;       // Số documents retrieve, default 3
}
