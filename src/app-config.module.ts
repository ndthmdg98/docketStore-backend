import {Module} from "@nestjs/common";


export class AppConfig {
    baseUrl: string;
    hostname: string;
    port: number;
}

// tslint:disable-next-line:variable-name
export const _baseUrl = 'http://localhost:3000';
// tslint:disable-next-line:variable-name
export const _hostname = 'localhost';
// tslint:disable-next-line:variable-name
export const _port = 3000;

export const APP_DI_CONFIG: AppConfig = {
    baseUrl: _baseUrl,
    hostname: _hostname,
    port: _port,
};

@Module({
    providers: [
        {
            provide: 'APP_CONFIG',
            useValue: APP_DI_CONFIG
        }
    ],
    exports: [{
        provide: 'APP_CONFIG',
        useValue: APP_DI_CONFIG
    }]
})
export class AppConfigModule {
}
