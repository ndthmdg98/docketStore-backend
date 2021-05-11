import {INotificationPayload} from "../notification.payload";

export const newDocket: INotificationPayload = {
    actions: [
        {action: "No", title: "No"}
        ],
    body: "New Docket from ",
    data: {dateOfArrival: new Date(), primaryKey: 1},
    icon: "",
    title: "New Docket",
    vibrate: [100, 50, 100]
}
