import {
    Module,
} from '@nestjs/common';

import {MailModule} from "./mail/mail.module";
import {MongooseModule} from "@nestjs/mongoose";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {UserSchema} from "../model/user.schema";
import {LocalStrategy} from "./local.strategy";
import {JwtStrategy} from "./jwt-strategy.service";
import {AuthService} from "./auth.service";
import {AuthController} from "./auth.controller";
import {UserModule} from "./user/user.module";
import {MulterModule} from "@nestjs/platform-express";
import {JwtConfig} from "../shared/config";
import {TagSchema} from "../model/tag.schema";
import {TagService} from "../api/tag/tag.service";
import {TagModule} from "../api/tag/tag.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
        MongooseModule.forFeature([{name: 'Tags', schema: TagSchema}]),
        TagModule,
        PassportModule,
        MulterModule.register({
            dest: './uploads',
        }),
        JwtModule.register({
            secret: JwtConfig.jwtSecret,
            signOptions: {expiresIn: '1h'},
        }),
        MailModule,
        UserModule
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, TagService],
    exports: [
        AuthService,
        MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
        MongooseModule.forFeature([{name: 'Tags', schema: TagSchema}])
    ],

})
export class AuthModule {
}
