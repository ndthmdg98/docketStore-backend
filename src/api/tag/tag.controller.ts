import {Body, Controller, Get, HttpStatus, Logger, Param, Post, Put, Req, Res, UseGuards} from '@nestjs/common';
import {TagService} from "./tag.service";
import {AuthGuard} from "@nestjs/passport";
import {Role, Roles} from "../../common/decorators/roles.decorator";
import {CreateTagDto} from "./interfaces";
import {RolesGuard} from "../../common/guards/roles.guard";
import {IResponse} from "../../auth/interfaces";




@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tag')
export class TagController {
    private readonly logger: Logger = new Logger("TagController")
    constructor(private tagService: TagService) {
    }

    @Roles(Role.APP_USER)
    @Post()
    async create(@Req() req, @Res() res, @Body() tagName: CreateTagDto): Promise<any> {
        const createTagDto: CreateTagDto = {userId: req.user._id, tagName: tagName.tagName};
        await this.tagService.create(createTagDto).then(tag => {
            return res.status(HttpStatus.OK).json(tag);
        })
    }

    @Roles(Role.APP_USER)
    @Get()
    async findAllByUser(@Req() req, @Res() res): Promise<IResponse> {
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
