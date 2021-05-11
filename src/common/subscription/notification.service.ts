import {Body, Injectable, Post, Response, UseGuards} from "@nestjs/common";
import * as webpush from 'web-push';
import {INotificationPayload} from "./notification.payload";
import {SubscriptionService} from "./subscription.service";


export interface INotificationService {

    sendNotificationByUserId(res, userId: string, notificationPayload: INotificationPayload)
    sendNotificationToAllUsers(res ,notificationPayload: INotificationPayload)

}



@Injectable()
export class NotificationService implements INotificationService {

    constructor(
        private readonly subscriptionService: SubscriptionService,
    ) {

    }

    sendNotificationByUserId(@Response() res, userId: string, notificationPayload: INotificationPayload) {
        this.subscriptionService.findSubscriptionsByUserId(userId).then(userSubscriptions => {
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
        this.subscriptionService.findAllSubscriptions().then(allSubscriptions => {
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
