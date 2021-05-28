import {IsNotEmpty} from "class-validator";

export class CreateDocketDto {

    @IsNotEmpty({message: "Empty Receiver ID"})
    readonly receiverId: string;


    constructor(receiverId: string) {
        this.receiverId = receiverId;
    }
}

