import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from "./auth/auth.module";
import {DocketModule} from "./api/docket/docket.module";
import {MongooseModule} from "@nestjs/mongoose";
import {FileLoaderModule} from "./api/file-loader/file-loader.module";
import {TagModule} from './api/tag/tag.module';
import {AppConfigModule} from "./app-config.module";

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost/docketstore'),
        AppConfigModule,
        FileLoaderModule,
        AuthModule,
        DocketModule,
        TagModule],
    controllers: [AppController],
    providers: [AppService,

    ],
})
export class AppModule {
}
