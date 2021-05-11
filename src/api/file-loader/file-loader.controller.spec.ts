import { Test, TestingModule } from '@nestjs/testing';
import { FileLoaderController } from './file-loader.controller';

describe('Imageloader Controller', () => {
  let controller: FileLoaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileLoaderController],
    }).compile();

    controller = module.get<FileLoaderController>(FileLoaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
