import {ApiProperty} from "@nestjs/swagger";

export class CreateTagDto {
    @ApiProperty()
    readonly tagName: string;

    @ApiProperty()
    readonly userId: string;


}
