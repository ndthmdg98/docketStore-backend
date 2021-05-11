import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {SubscriptionSchema} from "../../model/subscription.schema";
import {SubscriptionController} from "./subscription.controller";
import {SubscriptionService} from "./subscription.service";
import {NotificationService} from "./notification.service";
import {UserModule} from "../../auth/user/user.module";


@Module({
    imports: [MongooseModule.forFeature([{ name: 'Subscription', schema: SubscriptionSchema }]), UserModule],
    controllers: [SubscriptionController],
    providers: [SubscriptionService, NotificationService],
    exports: [SubscriptionService, NotificationService, MongooseModule.forFeature([{ name: 'Subscription', schema: SubscriptionSchema }])],
})
export class SubscriptionModule {}
