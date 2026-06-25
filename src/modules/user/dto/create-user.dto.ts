import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    avatarPath: string;

    @IsString()
    avatarUrl: string;

    @IsBoolean()
    isActive: boolean;
}
