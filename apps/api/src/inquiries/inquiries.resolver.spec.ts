import { Test, TestingModule } from '@nestjs/testing';

import { InquiriesResolver } from './inquiries.resolver';

describe('InquiriesResolver', () => {
  let resolver: InquiriesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquiriesResolver],
    }).compile();

    resolver = module.get<InquiriesResolver>(InquiriesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
