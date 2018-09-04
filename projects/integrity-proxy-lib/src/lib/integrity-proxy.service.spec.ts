import { TestBed, inject } from '@angular/core/testing';

import { IntegrityProxyService } from './integrity-proxy.service';
import { HttpRequest, HttpResponse } from './models';

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
    service
      .handlePath('/test', (data: HttpRequest) => Promise.resolve(new HttpResponse(200, 'OK')))
      .connect('https://proxy.svc-staging.plusintegrity.com')
      .then(hostname => console.log('hostname', hostname))
      .catch(error => console.log('error', error));
  }));
});
