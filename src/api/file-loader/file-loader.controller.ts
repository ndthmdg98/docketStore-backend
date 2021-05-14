import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {FileInterceptor} from "@nestjs/platform-express";
import {extname} from "path";
import {diskStorage} from 'multer';
import {UserService} from "../../auth/user/user.service";
import {DocketService} from "../docket/docket.service";
import {Role} from "../../common/decorators/roles.decorator";

const fs = require('fs');

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(
            new HttpException(
                'Only image files are allowed!',
                HttpStatus.BAD_REQUEST,
            ),
            false,
        );
    }
    callback(null, true);
};


export const pdfFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(pdf)$/)) {
        return callback(
            new HttpException(
                'Only pdf files are allowed!',
                HttpStatus.BAD_REQUEST,
            ),
            false,
        );
    }
    callback(null, true);
};

export const editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 10).toString(10))
        .join('');
    callback(null, `${name}${randomName}${fileExtName}`);
};

@UseGuards(AuthGuard('jwt'))
@Controller('file-loader')
export class FileLoaderController {
    readonly baseDir = '/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend';
    readonly uploadsFolder = '/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/uploads';
    readonly profileUploadsFolder = '/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/uploads';
    readonly docketUploadsFolder = '/Users/nicodiefenbacher/WebstormProjects/docketStore/docketStore-backend/uploads/dockets';

    constructor(private userService: UserService,
                private docketService: DocketService) {
    }

    @Post('/upload')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    uploadCompanyImage(@Req() req, @UploadedFile() file) {
        console.log(req.user)
        console.log(file)
        const company = req.user.company;
        company.companyImagePath = file.filename;
        this.userService.updateByID(req.user._id, {company}).then(updatedUser => {
            console.log(updatedUser)
        })
        console.log(file);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:b2b_user_id')
    async loadCompanyImage(@Param('b2b_user_id') userId: string,
                           @Res() res): Promise<any> {
        if (!userId) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
        }
        const user = await this.userService.findById(userId);
        if (user.roles.includes(Role.B2B_USER)) {
            console.log("load Company Image start....")
            console.log("get User from UserId....")

            console.log("start to load an company image");
            let filePath;
            console.log("start to search the image in uploads dir");
            await fs.readdir(this.uploadsFolder, async (err, files) => {
                if (err) {
                    console.log("error at file search")
                }
                if (files) {
                    console.log("found some files")
                    for (const file of files) {
                        if (file === user.company.companyImagePath) {
                            console.log("searched imagename found");
                            filePath = this.uploadsFolder + '/' + file;
                            const stat = fs.statSync(filePath);
                            const readStream = fs.createReadStream(filePath);
                            res.writeHead(200, {
                                'Content-Type': 'image/png',
                                'Content-Length': stat.size
                            });
                            readStream.pipe(res);
                        }
                    }
                }
            });
        } else {
            return null;
        }

    }

    @Post('/upload')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/dockets',
                filename: editFileName,
            }),
            fileFilter: pdfFileFilter,
        }),
    )
    uploadDockets(@Req() req, @UploadedFile() file) {
        console.log(req.user)
        console.log(file)
        const company = req.user.company;
        company.companyImagePath = file.filename;
        this.userService.updateByID(req.user._id, {company}).then(updatedUser => {
            console.log(updatedUser)
        })
        console.log(file);
    }


}
