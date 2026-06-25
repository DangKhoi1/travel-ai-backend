import { IsNotEmpty, IsString } from "class-validator";

export class loginAuthDto {
    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    password: string
}