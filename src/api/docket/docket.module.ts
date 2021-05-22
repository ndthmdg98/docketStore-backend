import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {DocketSchema} from "../../model/docket.schema";
import {DocketService} from "./docket.service";
import {TagSchema} from "../../model/tag.schema";
import {DocketController} from "./docket.controller";
import {TagService} from "./tag/tag.service";
import {TagController} from "./tag/tag.controller";
import {ExternalApiModule} from "./external-api/external-api.module";
import {UserSchema} from "../../model/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Dockets', schema: DocketSchema }]),
        MongooseModule.forFeature([{ name: 'Tags', schema: TagSchema }]),
        MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
        ExternalApiModule,
    ],
    controllers: [DocketController, TagController],
    providers: [DocketService, TagService],
    exports: [DocketService, TagService],
})
export class DocketModule {}
