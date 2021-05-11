import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {DocketService} from "./docket.service";
import {AuthGuard} from "@nestjs/passport";
import {Role, Roles} from "../../common/decorators/roles.decorator";
import {
    Docket,
    DocketDocument,
} from "../../model/docket.schema";
import {UserService} from "../../auth/user/user.service";
import {UserDocument} from "../../model/user.schema";
import {editFileName, FileLoaderService, fileFilter} from "../file-loader/file-loader.service";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from 'multer';
import {CreateDocketDto} from "./interfaces";
import {RolesGuard} from "../../common/guards/roles.guard";
import {IResponse} from "../../auth/interfaces";

export interface IDocketController {

    create_b2b(req, res, file, createObjectDto: CreateDocketDto): Promise<Docket | null>;

    create_app(req, res, file): Promise<Docket | null>;

    updateTagsByDocketId(req, res, id: string, tags: string[]): Promise<Docket>;

    findAllByUser(req, res): Promise<Docket[]>;

    findById(req, res, id: string): Promise<Docket | null>

}


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('docket')
export class DocketController implements IDocketController {
    private logger = new Logger('DocketControler');


    constructor(private docketService: DocketService,
                private fileLoaderServicce: FileLoaderService,
                private userService: UserService) {

    }


    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Post('app/create')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: function (req, file, cb) {
                    cb(null, `./uploads/${req.user.id}/`);
                },
                filename: editFileName,
            }),
            fileFilter: fileFilter,
        }),
    )
    async create_app(@Req() req, @Res() res, @UploadedFile() file): Promise<any> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const filePath = file.destination + file.filename;
        const sender = req.user;
        if (!filePath) {
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "File error";
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        }

        const docket = await this.docketService.create(sender, sender, filePath);
        if (docket.errors) {
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "Docket could not be created! Contact docketStore support"
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);

        }

        result.status = HttpStatus.OK;
        result.data = docket;
        result.success = true
        return res.status(HttpStatus.OK).json(result);
    }

    @Roles(Role.B2B_USER)
    @UseGuards(AuthGuard('jwt'))
    @Post('b2b/create')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: function (req, file, cb) {
                    cb(null, `./uploads/${req.body.receiverId}/`);
                },
                filename: editFileName,
            }),
            fileFilter: fileFilter,
        }),
    )
    async create_b2b(@Req() req, @Res() res, @UploadedFile() file, @Body() createObjectDto: CreateDocketDto): Promise<any> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }

        const filePath = file.destination + file.filename;
        const sender = req.user;
        if (!filePath) {
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "File error";
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        }
        const receiverUserId: string = createObjectDto.receiverId;
        if (!receiverUserId) {
            result.status = HttpStatus.BAD_REQUEST;
            result.data.message = "No receiver Id was given";
            return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        const receiver = await this.userService.findById(receiverUserId);
        if (!receiver) {
            result.status = HttpStatus.BAD_REQUEST;
            result.data.message = "Receiver Id does not exist";
            return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        const docket = await this.docketService.create(receiver, sender, filePath);
        if (docket.errors) {
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "Docket could not be created! Contact docketStore support"
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);

        }
        result.status = HttpStatus.OK;
        result.data = docket;
        result.success = true
        return res.status(HttpStatus.OK).json(result);
    }

    @Roles(Role.APP_USER)
    @Get('all')
    async findAllByUser(@Req() req, @Res() res): Promise<DocketDocument[]> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const user: UserDocument = req.user;
        const dockets = await this.docketService.findAllByUser(user);
        result.success = true;
        result.data = dockets;
        return res.status(HttpStatus.OK).json(result);
    }

    @Roles(Role.APP_USER)
    @Get(':id')
    async findById(@Req() req, @Res() res, @Param('id') id: string): Promise<DocketDocument | null> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const docket = await this.docketService.findById(id);
        result.success = true;
        result.data = docket;
        return res.status(HttpStatus.OK).json(result);
    }


    @Roles(Role.APP_USER)
    @Put(':id')
    async updateTagsByDocketId(@Req() req, @Res() res, @Param('id') id: string, @Body()  tags: string[]): Promise<DocketDocument | null> {
        //TODO incoming tags must be part of users tags
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const docket = await this.docketService.updateById(id, {tags: tags});
        if (!docket) {
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "Error";
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        }
        result.success = true;
        result.data = docket;
        return res.status(HttpStatus.OK).json(result);
    }

    //TODO Endpoint für Kassenbelege zur weitergabe von Kassenbelegen


}
