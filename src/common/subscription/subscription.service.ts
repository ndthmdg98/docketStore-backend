import {Body, Injectable, Post, Response, UseGuards} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, PassportLocalModel} from "mongoose";
import * as webpush from 'web-push';
import {INotificationPayload} from "./notification.payload";
import {CreateSubscriptionDto, Subscription, SubscriptionDocument} from "../../model/subscription.schema";

export interface ISubscriptionService {

    createSubscription(createNotificationDto: CreateSubscriptionDto): Promise<Subscription>
    deleteSubscriptionByUserId(userId: string): Promise<any>

    findAllSubscriptions(): Promise<Subscription[]>
    findSubscriptionsByUserId( userId: string): Promise<Subscription | Subscription[]>
    findSubscriptionsByUserOptions(options: object): Promise<Subscription | Subscription[]>


    sendNotificationByUserId(res, userId: string, notificationPayload: INotificationPayload)
    sendNotificationToAllUsers(res ,notificationPayload: INotificationPayload)

}


@Injectable()
export class SubscriptionService implements ISubscriptionService {


    constructor(
        @InjectModel('Subscription') private readonly subscriptionModel: Model<SubscriptionDocument>
    ) {

    }

    async createSubscription(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
        const createdNotification = new this.subscriptionModel(createSubscriptionDto);
        return await createdNotification.save();
    }

    async findAllSubscriptions(): Promise<Subscription[]> {
        return await this.subscriptionModel.find().exec();
    }


    async findSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
        const user = {_id: userId};
        return await this.findSubscriptionsByUserOptions({user: user});
    }

    async findSubscriptionsByUserOptions(options: object): Promise<Subscription[]> {
        return await this.subscriptionModel.find(options).exec();
    }


    async deleteSubscriptionByUserId(userId: string): Promise<any> {
        return await this.subscriptionModel.findByIdAndDelete(userId).exec();
    }

    sendNotificationByUserId(@Response() res, userId: string, notificationPayload: INotificationPayload): any {
        this.findSubscriptionsByUserId(userId).then(userSubscriptions => {
            console.log('Total subscriptions', userSubscriptions.length);
            Promise.all(userSubscriptions.map(sub => webpush.sendNotification(
                sub, JSON.stringify(notificationPayload))))
                .then(() => res.status(200).json({message: 'Docket sent successfully.'}))
                .catch(err => {
                    console.error("Error sending subscription, reason: ", err);
                    res.sendStatus(500);
                });

        });
    }

    sendNotificationToAllUsers(@Response() res) {
        this.findAllSubscriptions().then(allSubscriptions => {
            console.log('Total subscriptions', allSubscriptions.length);
            const notificationPayload = {

                title: "New Docket",
                body: "Docket from ",
                icon: "assets/main-page-logo-small-hat.png",
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: new Date(),
                    primaryKey: 1
                },
                actions: [{
                    action: "confirm",
                    title: "Press confirm to store this docket"
                }]
            }
            Promise.all(allSubscriptions.map(sub => webpush.sendNotification(
                sub, JSON.stringify(notificationPayload))))
                .then(() => res.status(200).json({message: 'Docket sent successfully.'}))
                .catch(err => {
                    console.error("Error sending subscription, reason: ", err);
                    res.sendStatus(500);
                });

        });
    }


}
