import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAuthDto {

    @IsString()
    @IsNotEmpty()
    userName: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    fullName: string

    @IsNumber()
    @IsNotEmpty()
    phoneNumber: string

    @IsString()
    avatarPath?: string

    @IsString()
    avatarUrl?: string

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean
}
