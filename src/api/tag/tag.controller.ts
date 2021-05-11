import {Body, Controller, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards} from '@nestjs/common';
import {Tag} from "../../model/tag.schema";
import {TagService} from "./tag.service";
import {AuthGuard} from "@nestjs/passport";
import {Role, Roles} from "../../common/decorators/roles.decorator";
import {CreateTagDto} from "./interfaces";
import {RolesGuard} from "../../common/guards/roles.guard";
import {IResponse} from "../../auth/interfaces";


export interface ITagController {

    create(req, res, file, createObjectDto: CreateTagDto): Promise<any>;

    updateById(req, res, id: string, valuesToChange: object): Promise<any>;

    findAllByUser(req, res): Promise<any[]>;

    findById(req, res, id: string): Promise<any>;

}


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tag')
export class TagController implements ITagController {

    constructor(private tagService: TagService) {
    }

    @Roles(Role.APP_USER)
    @Post()
    async create(@Req() req, @Res() res, file, @Body() createObjectDto: CreateTagDto): Promise<any> {
        await this.tagService.create(createObjectDto, req.user).then(tag => {
            return res.status(HttpStatus.OK).json(tag);
        })
    }

    @Roles(Role.APP_USER)
    @Get('all')
    async findAllByUser(@Req() req, @Res() res): Promise<any> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const tags = await this.tagService.findAllByUser(req.user);
        result.success = true;
        result.data = tags;
        return res.status(HttpStatus.OK).json(result);
    }

    @Roles(Role.APP_USER)
    @Get(':id')
    async findById(@Req() req, @Res() res, @Param('id') id: string): Promise<any> {
        await this.tagService.findById(id).then(tags => {
            return res.status(HttpStatus.OK).json(tags);
        })
    }

    @Roles(Role.APP_USER)
    @Put(':id')
    async updateById(@Req() req, @Res() res, @Param('id') id: string, @Body() valuesToChange: object): Promise<any> {
        await this.tagService.updateById(id, valuesToChange).then(tags => {
            return res.status(HttpStatus.OK).json(tags);
        })
    }


}
