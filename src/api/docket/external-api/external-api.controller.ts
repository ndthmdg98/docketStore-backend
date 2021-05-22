import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {Role, Roles} from "../../../common/decorators/roles.decorator";
import {ExternalApiService} from "./external-api.service";
import {ChangePasswordDto, CreateExternalAPIAccountDto} from "../../../model/external-api-account.schema";
import {APIResponse} from "../../../interfaces";


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('external-api')
export class ExternalApiController {

    private logger = new Logger('ExternalApiController');

    constructor(private externalAPIService: ExternalApiService) {
    }

    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Post()
    async storeNewExternalAPIAccount(@Req() req, @Res() res, @Body() newExternalAPI: CreateExternalAPIAccountDto): Promise<APIResponse> {
        this.logger.log("** || Request - Store new External API Account ||**")

        const userId = req.user._id;

        const createdExternalAPIAccount = await this.externalAPIService.storeNewExternalAPIAccount(userId, newExternalAPI);
        if (createdExternalAPIAccount) {
            const message = "External API Account successfully added!";
            this.logger.log(message);
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(createdExternalAPIAccount._id));
        } else {
            const errMessage = "Error: Account could not be added!";
            this.logger.error(errMessage);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllExternalAPIAccountsOfAUser(@Req() req, @Res() res): Promise<APIResponse> {
        const userId = req.user._id;
        const allExternalAPIAccountsOfAUser = await this.externalAPIService.findAllExternalAPIAccountsByUserId(userId);
        if (allExternalAPIAccountsOfAUser) {
            return res.status(HttpStatus.OK).json(APIResponse.successResponse(allExternalAPIAccountsOfAUser))
        } else {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }


    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async delete(@Req() req, @Res() res, @Param('id') externalAPIAccountId: string): Promise<APIResponse> {
        const deletedAccount = await this.externalAPIService.deleteExternalAPIAccount(externalAPIAccountId);
        if (deletedAccount) {
            console.log("Account successfully deleted")
            return res.status(HttpStatus.OK).json(APIResponse.successResponse());
        } else {
            console.log("Account could not be deleted!")
            return res.status(HttpStatus.OK).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }


    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Put(':id/change-password')
    async changePasswordOfExternalAPIAccount(@Req() req, @Res() res, @Param('id') externalAPIAccountId: string, changePasswordDto: ChangePasswordDto): Promise<APIResponse> {
        if (changePasswordDto.password1 == changePasswordDto.password2) {
            const password = changePasswordDto.password1;
            const newExternalAPIAccountDocument = await this.externalAPIService.changePasswordOfExternalAPIAccount(externalAPIAccountId, password);
            if (newExternalAPIAccountDocument) {
                return res.status(HttpStatus.OK).json(APIResponse.successResponse());
            } else {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(APIResponse.errorResponse(HttpStatus.INTERNAL_SERVER_ERROR));
            }
        }
       return res.status(HttpStatus.BAD_REQUEST).json(APIResponse.errorResponse(HttpStatus.BAD_REQUEST))

    }


}
