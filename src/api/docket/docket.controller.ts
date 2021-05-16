import {
    Body,
    Controller, Delete,
    Get, HttpException,
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
import {Docket, DocketDocument, DocketFile} from "../../model/docket.schema";
import {UserService} from "../../auth/user/user.service";
import {FileInterceptor} from "@nestjs/platform-express";
import {CreateDocketDto} from "./interfaces";
import {RolesGuard} from "../../common/guards/roles.guard";
import {IResponse} from "../../auth/interfaces";
import {Readable} from 'stream';
import {TagService} from "../tag/tag.service";

export const fileFilter = (req, file, callback) => {
    if (file.originalname.match(/\.(pdf)$/) || file.originalname.match(/\.(png)$/) || file.originalname.match(/\.(jpg)$/)) {
        callback(null, true);
    } else {
        return callback(
            new HttpException(
                'Only pdf, png or jpg files are allowed!',
                HttpStatus.BAD_REQUEST,
            ),
            false,
        );
    }

};

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('docket')
export class DocketController {
    private logger = new Logger('DocketController');


    constructor(private docketService: DocketService,
                private tagService: TagService,
                private userService: UserService) {

    }

    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Post('app/create')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: fileFilter,
        }),
    )
    async import(@Req() req, @Res() res, @UploadedFile() file): Promise<IResponse> {
        this.logger.log('**Import Docket Request')
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const senderId = req.user._id;
        if (!file) {
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "No File Error";
            this.logger.error(`No File Error. User ${senderId} has sent this request`)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        }
        const docketFile  = new DocketFile(file.encoding, file.mimetype, Buffer.from(file.buffer), file.size);
        const docket = await this.docketService.create(senderId, senderId, docketFile);
        if (docket.errors) {
            const message = "Docket could not be created! Contact docketStore support"
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            this.logger.error(message)
            result.data.message = message
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);

        }
        const message = "Docket successfully created!";
        this.logger.log(message)
        result.status = HttpStatus.OK;
        result.data.message =  message;
        result.success = true
        return res.status(HttpStatus.OK).json(result);
    }

    @Roles(Role.B2B_USER)
    @UseGuards(AuthGuard('jwt'))
    @Post('b2b/create')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: fileFilter,
        }),
    )
    async create_b2b(@Req() req, @Res() res, @UploadedFile() file, @Body() createObjectDto: CreateDocketDto): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const senderId = req.user._id;
        if (!file) {
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "File error";
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        }
        const receiverId: string = createObjectDto.receiverId;
        if (!receiverId) {
            result.status = HttpStatus.BAD_REQUEST;
            result.data.message = "No receiver Id was given";
            return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        const receiver = await this.userService.findById(receiverId);
        if (!receiver) {
            result.status = HttpStatus.BAD_REQUEST;
            result.data.message = "Receiver Id does not exist";
            return res.status(HttpStatus.BAD_REQUEST).json(result);
        }
        const docketFile  = new DocketFile(file.encoding, file.mimetype, Buffer.from(file.buffer), file.size);
        const docket = await this.docketService.create(receiverId, senderId, docketFile);
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
    @Get()
    async findAllByUser(@Req() req, @Res() res): Promise<any> {
        this.logger.log("**Get All Dockets From User Request**")
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const user = req.user;
        const dockets = await this.docketService.findAllByUserId(user._id);
        this.logger.log(`Return ${dockets.length} Dockets!`)
        result.success = true;
        result.data = dockets;
        return res.status(HttpStatus.OK).json(result);
    }

    @Roles(Role.APP_USER)
    @Get(':id')
    async findById(@Req() req, @Res() res, @Param('id') id: string): Promise<any> {
        const accept = req.headers.accept;
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const docketDocument = await this.docketService.findById(id);
        if (accept === "application/json") {
            result.success = true;
            result.data = docketDocument
            return res.status(HttpStatus.OK).json(result);
        } else if (accept === "application/pdf") {
            const readable: Readable = docketDocument.docketFile.toReadable();
            res.writeHead(200, {
                'Content-Type': "application/pdf",
                'Content-Length': readable.readableLength
            });
            readable.pipe(res)
        }

    }

    @Roles(Role.APP_USER)
    @Get('tag/:tagId')
    async findByTags(@Req() req, @Res() res, @Param('tagId') tagId: string): Promise<any> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const docketDocuments = await this.docketService.findByTag(tagId);
        result.success = true;
        result.data = docketDocuments
        return res.status(HttpStatus.OK).json(result);
    }


    @Roles(Role.APP_USER)
    @Put(':docketId/mark/:tagId')
    async markDocketWithTag(@Req() req, @Res() res, @Param('docketId') docketId: string, @Param('tagId') tagId: string): Promise<DocketDocument | null> {
        //TODO incoming tags must be part of users tags
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const markedDocket = await this.docketService.markDocketWithTag(docketId, tagId);
        if (markedDocket.errors) {
            //TODO Error handling
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "Error";
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        } else {
            result.success = true;
            result.data = markedDocket;
            return res.status(HttpStatus.OK).json(result);
        }
    }

    @Roles(Role.APP_USER)
    @Put(':docketId/unmark/:tagId')
    async unmarkDocketWithTag(@Req() req, @Res() res, @Param('docketId') docketId: string, @Param('tagId') tagId: string): Promise<DocketDocument | null> {
        //TODO incoming tags must be part of users tags
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const docket = await this.docketService.findById(docketId);
        if (docket.errors) {
            //TODO Error handling after find Docket By Id
            result.status = HttpStatus.INTERNAL_SERVER_ERROR;
            result.data.message = "Error";
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        } else {
            const updatedDocket = await this.docketService.unmarkDocketWithTag(docketId, tagId);
            if (updatedDocket.errors) {
                //TODO Error Handling after unmark Docket
            }
            result.success = true;
            result.data = updatedDocket;
            return res.status(HttpStatus.OK).json(result);
        }

    }

    @Roles(Role.APP_USER)
    @Delete(':id')
    async deleteById(@Req() req, @Res() res, @Param('id') id: string): Promise<Docket | null> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const deletedDocket = await this.docketService.deleteById(id);
        if (deletedDocket == null) {
            result.success = true;
            result.data = {message: "Docket succesfully deleted"}
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
        }
        result.success = false;
        result.data = {message: "Docket deletion failed"}
        return res.status(HttpStatus.OK).json(result);
    }

    //TODO Endpoint für Kassenbelege zur weitergabe von Kassenbelegen


}
