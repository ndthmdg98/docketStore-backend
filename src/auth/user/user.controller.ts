import {
    Body,
    Controller, Delete, Get, HttpCode, HttpStatus,
    Logger, Param, Post, Put, Req, Res, UseGuards,
} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {UserService} from "./user.service";
import {User} from "../../model/user.schema";
import {CreateAppUserDto, CreateB2BUserDto} from "../interfaces";




export interface IUserController{
    create(req, res, createObjectDto: CreateB2BUserDto | CreateAppUserDto): Promise<User | null>;

    findAll(req, res): Promise<User[]>;
    findById(req, res, id: string): Promise<User | null>;
    findOne(req, res, options: object): Promise<User[] | User | null>;

    updateByID(req, res, id: string, valuesToChange: object): Promise<User | null>;
    updateOne(req, res, findUserOptions: object, valuesToChange: object): Promise<User | null>;

    deleteAll( req, res): Promise<any>;
    deleteByID(req, res, id: string): Promise<any>;
    deleteOne(req, res, options: object): Promise<any>;
}






@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController implements IUserController {
    private logger = new Logger('UserController');

    constructor(private userService: UserService) {
    }

    @Post()
    async create(@Req() req, @Res() res, createObjectDto: CreateAppUserDto | CreateB2BUserDto): Promise<User | null> {
        return await this.userService.create(createObjectDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete()
    async deleteAll(@Req() req, @Res() res): Promise<any> {
        return await this.userService.deleteAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteByID(@Req() req, @Res() res, @Param('id') id: string): Promise<any> {
        return await this.userService.deleteByID(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete()
    async deleteOne(@Req() req, @Res() res, options: object): Promise<any> {
        return await this.userService.deleteOne(options);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Req() req, @Res() res): Promise<User[]> {
        return await this.userService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async findById(@Req() req, @Res() res,@Param('id') id: string): Promise<User | null> {
        return await this.userService.findById(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findOne(@Req() req, @Res() res, options: object): Promise<User[] | User | null> {
        return await this.userService.findOne(options);
    }



    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async updateByID(@Req() req, @Res() res,@Param('id') id: string, valuesToChange: object): Promise<User | null> {
        return await this.userService.updateByID(id, valuesToChange);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put()
    async updateOne(@Req() req, @Res() res, findUserOptions: object, valuesToChange: object): Promise<User | null> {
        return await this.userService.updateOne(findUserOptions, valuesToChange);
    }


}
