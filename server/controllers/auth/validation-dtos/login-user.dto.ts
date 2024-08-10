import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
    @IsNotEmpty()
    @Length(3, 255)
    @IsString()
    public email: string;

    @IsNotEmpty()
    @Length(3, 255)
    @IsString()
    public password: string;
}
