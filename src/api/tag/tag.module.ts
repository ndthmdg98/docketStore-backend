import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import {MongooseModule} from "@nestjs/mongoose";
import {TagSchema} from "../../model/tag.schema";
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Tags', schema: TagSchema }])],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
