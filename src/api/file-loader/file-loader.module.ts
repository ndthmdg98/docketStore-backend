import {
    Module,
} from '@nestjs/common';
import {FileLoaderService} from "./file-loader.service";
import {FileLoaderController} from "./file-loader.controller";
import {UserService} from "../../auth/user/user.service";
import {UserModule} from "../../auth/user/user.module";
import {MongooseModule} from "@nestjs/mongoose";
import {UserSchema} from "../../model/user.schema";
import {DocketModule} from "../docket/docket.module";
@Module({
    imports: [UserModule, DocketModule, MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
    controllers: [FileLoaderController],
    providers: [FileLoaderService],
    exports: [FileLoaderService],

})
export class FileLoaderModule {
}
