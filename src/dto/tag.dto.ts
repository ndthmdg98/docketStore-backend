import {IsNotEmpty} from "class-validator";

export class CreateTagDto {
    @IsNotEmpty()
    readonly tagName: string;

    constructor(tagName: string) {
        this.tagName = tagName;
    }
}
export class RenameTagDto {
    @IsNotEmpty()
    readonly newTagName: string;

    constructor(newTagName: string) {
        this.newTagName = newTagName;
    }
}
