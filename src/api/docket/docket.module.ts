import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {DocketController} from "./docket.controller";
import {DocketSchema} from "../../model/docket.schema";
import {UserModule} from "../../auth/user/user.module";
import {DocketService} from "./docket.service";
import {FileLoaderService} from "../file-loader/file-loader.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Dockets', schema: DocketSchema }]), UserModule],
    controllers: [DocketController],
    providers: [DocketService, FileLoaderService],
    exports: [DocketService],
})
export class DocketModule {}
