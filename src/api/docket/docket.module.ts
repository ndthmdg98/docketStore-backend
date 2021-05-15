import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {DocketController} from "./docket.controller";
import {DocketSchema} from "../../model/docket.schema";
import {UserModule} from "../../auth/user/user.module";
import {DocketService} from "./docket.service";
import {TagService} from "../tag/tag.service";
import {TagSchema} from "../../model/tag.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Dockets', schema: DocketSchema }]),
        MongooseModule.forFeature([{ name: 'Tags', schema: TagSchema }]),
        UserModule
    ],
    controllers: [DocketController],
    providers: [DocketService, TagService],
    exports: [DocketService],
})
export class DocketModule {}
