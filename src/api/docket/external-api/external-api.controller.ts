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
import {IResponse} from "../../../interfaces";
import {ChangePasswordDto, CreateExternalAPIAccountDto} from "../../../model/external-api-account.schema";


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('external-api')
export class ExternalApiController {

    private logger = new Logger('ExternalApiController');

    constructor(private externalAPIService: ExternalApiService) {
    }

    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Post()
    async storeNewExternalAPIAccount(@Req() req, @Res() res, @Body() newExternalAPI: CreateExternalAPIAccountDto): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const userId = req.user._id;
        const createdExternalAPIAccount = await this.externalAPIService.storeNewExternalAPIAccount(userId, newExternalAPI);
        if (createdExternalAPIAccount) {
            result.data.message = "Account successfully added!";
            result.data.success = true;
            return res.status(HttpStatus.OK).json(result);
        } else {
            result.data.message = "Account could not be added!";
            result.data.success = false;
            return res.status(HttpStatus.OK).json(result);
        }
    }
    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllExternalAPIAccountsOfAUser(@Req() req, @Res() res): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const userId = req.user._id;
        const allExternalAPIAccountsOfAUser = await this.externalAPIService.findAllExternalAPIAccountsByUserId(userId);
        if (allExternalAPIAccountsOfAUser) {
            result.data.success = true;
            result.data = allExternalAPIAccountsOfAUser;
            return res.status(HttpStatus.OK).json(result);
        } else {
            result.data.message = "Error occured";
            result.data.success = false;
            return res.status(HttpStatus.OK).json(result);
        }
    }


    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async delete(@Req() req, @Res() res, @Param('id') externalAPIAccountId: string): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        const deletedAccount = await this.externalAPIService.deleteExternalAPIAccount(externalAPIAccountId);
        if (deletedAccount) {
            const message = "Account successfully deleted"
            result.data.message = message;
            result.data.success = true;
            return res.status(HttpStatus.OK).json(result);
        } else {
            const errMessage = "Account could not be deleted!"
            result.data.message = errMessage;
            result.data.success = false;
            return res.status(HttpStatus.OK).json(result);
        }
    }


    @Roles(Role.APP_USER)
    @UseGuards(AuthGuard('jwt'))
    @Put(':id/change-password')
    async changePasswordOfExternalAPIAccount(@Req() req, @Res() res, @Param('id') externalAPIAccountId: string, changePasswordDto: ChangePasswordDto): Promise<IResponse> {
        const result: IResponse = {
            status: HttpStatus.OK,
            success: false,
            data: {}
        }
        if (changePasswordDto.password1 == changePasswordDto.password2) {
            const password = changePasswordDto.password1;
            const newExternalAPIAccountDocument = await this.externalAPIService.changePasswordOfExternalAPIAccount(externalAPIAccountId, password);
            //TODO Fehlerbearbeitung
            const message = "Password of External API Account was succesfully changed!";
            result.data.message = message;
            result.success = true;
            res.status(HttpStatus.OK).json(result);
        } else {
            const errMessage = "Password missmatch";
            result.data.message = errMessage;
            result.status = HttpStatus.BAD_REQUEST;
            result.success = false;
            res.status(HttpStatus.OK).json(result);
        }
        return result;
    }


}
