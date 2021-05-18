import {HttpModule, Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ExternalApiService} from "./external-api.service";
import {DmApiService} from "./services/dm-api.service";
import {LidlApiService} from "./services/lidl-api.service";
import {ReweApiService} from "./services/rewe-api.service";
import {ExternalAPIAccountSchema} from "../../../model/external-api-account.schema";
import {ExternalApiController} from "./external-api.controller";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'ExternalAPIAccounts', schema: ExternalAPIAccountSchema}]),
        HttpModule
    ],
    controllers: [ExternalApiController],
    providers: [ExternalApiService, DmApiService, LidlApiService, ReweApiService],
    exports: [ExternalApiService],
})
export class ExternalApiModule {
}
