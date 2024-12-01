import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterUserDto {
    @IsNotEmpty()
    @Length(3, 255)
    @IsString()
    public username: string;

    @IsNotEmpty()
    @Length(3, 255)
    @IsString()
    public email: string;

    @IsNotEmpty()
    @Length(3, 255)
    @IsString()
    public password: string;
}
