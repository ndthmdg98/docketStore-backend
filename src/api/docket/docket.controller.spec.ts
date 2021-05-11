import { Test, TestingModule } from '@nestjs/testing';
import { DocketController } from './docket.controller';

describe('Docket Controller', () => {
  let controller: DocketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocketController],
    }).compile();

    controller = module.get<DocketController>(DocketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
