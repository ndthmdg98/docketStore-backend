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
import {RolesGuard} from "../../common/guards/roles.guard";
import {DocketService} from "./docket.service";
import {TagService} from "./tag/tag.service";
import {Role, Roles} from "../../common/decorators/roles.decorator";
import {FileInterceptor} from "@nestjs/platform-express";
import {Docket, DocketDocument, DocketFile} from "../../model/docket.schema";
import {Readable} from "stream";
import {APIResponse} from "../../interfaces";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('docket')
export class DocketController {
    private logger = new Logger('DocketController');

    constructor(private docketService: DocketService,
                private tagService: TagService) {
    }


    @Roles(Role.APP_USER)
    @UseGuards(JwtAuthGuard)
    @Post('import')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: fileFilter,
        }),
    )
    async import(@Req() req, @Res() res, @UploadedFile() file): Promise<APIResponse> {
        this.logger.log('**Import Docket Request')
        const senderId = req.user._id;
        if (!file) {
            this.logger.error(`No File Error. User ${senderId} has sent this request`)
            return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST));
        }
        const docketFile = new DocketFile(file.encoding, file.mimetype, file.buffer, file.size);
        const docket = await this.docketService.create(senderId, senderId, docketFile);
        if (docket) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(docket._id));
        } else {
            this.logger.log(docket.errors);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Roles(Role.B2B_USER)
    @UseGuards(JwtAuthGuard)
    @Post('create/:receiverId')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: fileFilter,
        }),
    )
    async insertDocketFromExternalCompany(@Req() req, @Res() res, @UploadedFile() file, @Param('receiverId') receiverId: string): Promise<APIResponse> {
        const senderId = req.user._id;
        if (!file) {
            this.logger.error(`No File Error. User ${senderId} has sent this request`)
            return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST));
        }
        const docketFile = new DocketFile(file.encoding, file.mimetype, file.buffer, file.size);
        const docket = await this.docketService.create(receiverId, senderId, docketFile);
        if (docket) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(docket._id));
        } else {
            this.logger.error(`Receiver not found Error. User ${senderId} has sent this request`)
            return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST));
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Get()
    async findAllByUser(@Req() req, @Res() res): Promise<any> {
        this.logger.log("**Get All Dockets From User Request**")
        const user = req.user;
        const dockets = await this.docketService.findAllByUserId(user._id);
        this.logger.log(`Return ${dockets.length} Dockets!`)
        return res.status(HttpStatus.OK).json(APIResponse.successResponse(dockets));
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Get(':id')
    async findById(@Req() req, @Res() res, @Param('id') id: string): Promise<any> {
        const accept = req.headers.accept;
        const docketDocument = await this.docketService.findById(id);
        if (docketDocument) {
            if (accept === "application/json") {
                return res.status(HttpStatus.OK).json(APIResponse.successResponse(docketDocument));
            } else if (accept === "application/pdf") {
                const readable: Readable = this.docketService.toReadable(docketDocument.docketFile);
                res.writeHead(200, {
                    'Content-Type': "application/pdf",
                    'Content-Length': readable.readableLength
                });
                readable.pipe(res)
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json(APIResponse.errorResponse(HttpStatus.NOT_FOUND));
        }

    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Get('tag/:tagId')
    async findByTags(@Req() req, @Res() res, @Param('tagId') tagId: string): Promise<any> {
        const docketDocuments = await this.docketService.findByTag(tagId);
        return res.status(HttpStatus.OK).json(APIResponse.successResponse(docketDocuments));
    }


    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Put(':docketId/mark/:tagId')
    async markDocketWithTag(@Req() req, @Res() res, @Param('docketId') docketId: string, @Param('tagId') tagId: string): Promise<DocketDocument | null> {
        const tag = await this.tagService.findById(tagId);
        if (tag.userId == req.user._id) {
            const docketDocument = await this.docketService.findById(docketId);
            if (!docketDocument) {
                return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.successResponse(HttpStatus.NOT_FOUND));
            }
            await this.docketService.markDocketWithTag(docketDocument, tagId);
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(HttpStatus.OK));
        }
        return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST))
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Put(':docketId/unmark/:tagId')
    async unmarkDocketWithTag(@Req() req, @Res() res, @Param('docketId') docketId: string, @Param('tagId') tagId: string): Promise<DocketDocument | null> {
        const tag = await this.tagService.findById(tagId);
        if (tag.userId == req.user._id) {
            const docketDocument = await this.docketService.findById(docketId);
            if (!docketDocument) {
                return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.successResponse(HttpStatus.NOT_FOUND));
            }
            await this.docketService.unmarkDocketWithTag(docketDocument, tagId);
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(HttpStatus.OK));
        }
        return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST))

    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.APP_USER)
    @Delete(':id')
    async deleteById(@Req() req, @Res() res, @Param('id') id: string): Promise<Docket | null> {
        const success = await this.docketService.deleteById(id);
        if (success) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse());
        }
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }


}

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
