export interface IData {
    primaryKey: number;
    dateOfArrival: Date;
}


export interface IAction {
    action: string;
    title: string;
}


export interface INotificationPayload {
    title: string,
    body: string,
    icon: string,
    vibrate: [100, 50, 100],
    data: {
        dateOfArrival: Date,
        primaryKey: 1
    },
    actions: [{
        action: string,
        title: string
    }]
}
