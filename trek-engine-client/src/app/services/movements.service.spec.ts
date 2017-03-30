import { TestBed, inject } from '@angular/core/testing';

import { MovementsService } from './movements.service';

describe('MovementsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovementsService]
    });
  });

  it('should ...', inject([MovementsService], (service: MovementsService) => {
    expect(service).toBeTruthy();
  }));
});
