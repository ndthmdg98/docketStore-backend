import { LoggerService } from '@nestjs/common';

export class Logger implements LoggerService {
    log(message: string) {

    }
    error(message: string, trace: string) {
        /* your implementation */
    }
    warn(message: string) {
        /* your implementation */
    }
    debug(message: string) {
        /* your implementation */
    }
    verbose(message: string) {
        /* your implementation */
    }
}
