import {MinLength} from "class-validator";

export class ChangePasswordDto {
    @MinLength(10, {
        message: 'Password is too short',
    })
    password1: string;
    @MinLength(10, {
        message: 'Password is too short',
    })
    password2: string
}
