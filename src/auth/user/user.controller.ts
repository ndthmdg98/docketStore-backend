import {
    Controller,
    Logger, UseGuards,
} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {UserService} from "./user.service";

export interface IUserController {

}

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController implements IUserController {
    private logger = new Logger('UserController');

    constructor(private userService: UserService) {
    }


}
