import {ApiProperty} from "@nestjs/swagger";

export class CreateDocketDto {
    @ApiProperty()
    readonly receiverId: string;
}

