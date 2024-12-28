import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export class SearchUsersDto {
    @IsNumberString()
    public page: string | undefined;
    @IsNumberString()
    public perPage: string | undefined;

    @IsNotEmpty()
    @Length(1, 255)
    @IsString({
        message: 'Enter a valid keyword for search',
    })
    public keyword: string;
}
