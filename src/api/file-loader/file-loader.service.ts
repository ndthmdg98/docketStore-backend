import {
    HttpException, HttpStatus,
    Injectable,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {FileInterceptor} from "@nestjs/platform-express";
import {extname} from "path";
import {diskStorage} from 'multer';
import {DocketService} from "../docket/docket.service";


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

export const editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 10).toString(10))
        .join('');
    callback(null, `${name}${randomName}${fileExtName}`);
};

@Injectable()
export class FileLoaderService {


    constructor(public docketService: DocketService) {

    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/dockets',
                filename: editFileName,
            }),
            fileFilter: fileFilter,
        }),
    )
    async uploadDocket(docketID: string, @UploadedFile() file): Promise<any> {
        return await this.docketService.updateById(docketID, {filePath: file.filename});
    }


}
