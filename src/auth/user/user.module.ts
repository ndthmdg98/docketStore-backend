import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {UserSchema} from "../../model/user.schema";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {TagSchema} from "../../model/tag.schema";
import {TagService} from "../../api/docket/tag/tag.service";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Users', schema: UserSchema}]),MongooseModule.forFeature([{name: 'Tags', schema: TagSchema}])],
    controllers: [UserController],
    providers: [UserService, TagService],
    exports: [UserService, TagService],
})
export class UserModule {
}
