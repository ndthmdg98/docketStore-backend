import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {UserSchema} from "../../model/user.schema";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Users', schema: UserSchema}])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {
}
