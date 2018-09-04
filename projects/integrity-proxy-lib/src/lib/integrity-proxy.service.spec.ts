import { TestBed, inject } from '@angular/core/testing';

import { IntegrityProxyService } from './integrity-proxy.service';

describe('IntegrityProxyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntegrityProxyService]
    });
  });

  it('should be created', inject([IntegrityProxyService], (service: IntegrityProxyService) => {
    expect(service).toBeTruthy();
  }));

  it('should be able to connect', inject([IntegrityProxyService], (service: IntegrityProxyService) => {
    service.initialize('https://proxy.svc-staging.plusintegrity.com');
  }));
});
