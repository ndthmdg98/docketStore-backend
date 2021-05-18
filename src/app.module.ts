import {HttpModule, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule, JwtConfig, MailConfig} from "./auth/auth.module";
import {DocketModule} from "./api/docket/docket.module";
import {MongooseModule} from "@nestjs/mongoose";

export const NETWORK_DI_CONFIG: NetworkConfig = {
    baseHostUrl:  'http://localhost:3000',
    baseHostname: 'localhost',
    port: 3000,
};

export const DATABASE_DI_CONFIG: DatabaseConfig = {
    hostname: "localhost",
    databaseName: "docketstore",
    credentials: {username: "", password: ""}
}

export const DATABASE_URL = `mongodb://${DATABASE_DI_CONFIG.hostname}/${DATABASE_DI_CONFIG.databaseName}`;
export const APP_DI_CONFIG: AppConfig = {
    networkConfig: NETWORK_DI_CONFIG,
    databaseConfig: DATABASE_DI_CONFIG
};




@Module({
    imports: [
        MongooseModule.forRoot(DATABASE_URL),
        AuthModule,
        DocketModule,
        HttpModule
    ],
    controllers: [AppController],
    providers: [AppService,
        {
            provide: 'APP_CONFIG',
            useValue: APP_DI_CONFIG
        },

    ],
})
export class AppModule {
}



export class AppConfig {
    networkConfig: NetworkConfig;
    databaseConfig: DatabaseConfig;
}

export class NetworkConfig {
    baseHostUrl: string;
    baseHostname: string;
    port: number;
}

export class DatabaseConfig {
    hostname: string;
    credentials: Credentials;
    databaseName: string;
}

export interface Credentials {
    username: string;
    password: string;
}
