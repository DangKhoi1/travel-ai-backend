import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    username: string

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
    @IsNotEmpty()
    avatarPath: string

    @IsString()
    avatarUrl: string

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean
}
