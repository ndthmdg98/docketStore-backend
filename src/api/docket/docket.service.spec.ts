import { Test, TestingModule } from '@nestjs/testing';
import { DocketService } from './docket.service';

describe('DocketService', () => {
  let service: DocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocketService],
    }).compile();

    service = module.get<DocketService>(DocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
