import {Body, Controller, Delete, Get, HttpStatus, Logger, Param, Post, Put, Req, Res, UseGuards} from '@nestjs/common';
import {RolesGuard} from "../../../common/guards/roles.guard";
import {Role, Roles} from "../../../common/decorators/roles.decorator";
import {TagService} from "./tag.service";
import {APIResponse} from "../../../interfaces";
import {CreateTagDto, RenameTagDto} from "../../../dto/tag.dto";
import {JwtAuthGuard} from "../../../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tag')
export class TagController {
    private readonly logger: Logger = new Logger("TagController")

    constructor(private tagService: TagService) {
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Post()
    async create(@Req() req, @Res() res, @Body() createdTagDto: CreateTagDto): Promise<APIResponse> {
        const createdTag = await this.tagService.create(req.user._id, createdTagDto);
        if (createdTag) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(createdTag._id))
        }
        this.logger.log(createdTag.errors);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR))
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Get()
    async findAllByUserId(@Req() req, @Res() res): Promise<APIResponse> {
        const tags = await this.tagService.findAllByUserId(req.user._id);
        return res.status(HttpStatus.OK).json(APIResponse.successResponse(tags));
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Get(':id')
    async findById(@Req() req, @Res() res, @Param('id') id: string): Promise<any> {
        const tag = await this.tagService.findById(id);
        if (tag) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(tag));
        }
        return res.status(HttpStatus.NOT_FOUND).json(APIResponse.errorResponse(HttpStatus.NOT_FOUND));
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Put(':id/')
    async rename(@Req() req, @Res() res, @Param('id') id: string, @Body() renameTagDto: RenameTagDto): Promise<any> {
        const success = await this.tagService.rename(id, renameTagDto);
        if (success) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse());
        }
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR))

    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Delete(':id/')
    async delete(@Req() req, @Res() res, @Param('id') id: string,): Promise<any> {
        const success = await this.tagService.deleteById(id);
        if (success) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse());
        }
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR))

    }
}
