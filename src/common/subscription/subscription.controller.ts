import {
    Controller,
    Response,
    Post,
    Body, UseGuards, Param, Delete, Put,
} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import * as webpush from 'web-push';
import {SubscriptionService} from "./subscription.service";
import {CreateSubscriptionDto, Subscription} from "../../model/subscription.schema";

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {

    readonly VAPID_PUBLIC_KEY = {
        publicKey: 'BN0p6DZTChd0X6G0hs_6ECi9Q5O3K2NvlcKjhP6TUJkSXbXUTwA-dLy3s5e25f6KtfNxKsjzcbapF3X21iZJK0I',
        privateKey: "dcHOFdMydZBuSri9TqdPjPDzYhVuWJQM_9ledr71pec"}

    constructor(public subscriptionService: SubscriptionService) {
        webpush.setVapidDetails(
            this.VAPID_PUBLIC_KEY.publicKey,
            this.VAPID_PUBLIC_KEY.privateKey);
    }

    @Post('add')
    async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription | Subscription[]> {
        return await this.subscriptionService.createSubscription(createSubscriptionDto);
    }

}
