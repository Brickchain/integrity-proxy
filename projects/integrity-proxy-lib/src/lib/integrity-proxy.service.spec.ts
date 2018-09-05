import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IntegrityProxyService } from './integrity-proxy.service';
import { HttpRequest, HttpResponse } from './models';

describe('IntegrityProxyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [HttpClient, IntegrityProxyService]
    });
  });

  it('should be created', inject([IntegrityProxyService], (service: IntegrityProxyService) => {
    expect(service).toBeTruthy();
  }));

  it('should fail to connect', (done) =>
    inject([HttpClient, IntegrityProxyService], (http: HttpClient, service: IntegrityProxyService) => {
      service.connect('https://dne.svc-staging.plusintegrity.com')
        .then(hostname => fail(`Connected to ${hostname}`))
        .then(() => service.disconnect())
        .catch(error => expect(error).toBeTruthy())
        .then(() => done());
    })());

  it('should be able to connect and make a request', (done) =>
    inject([HttpClient, IntegrityProxyService], (http: HttpClient, service: IntegrityProxyService) => {
      const payload = {
        ts: Date.now()
      };
      service
        .setHandler('/test', (request: HttpRequest) => Promise.resolve(new HttpResponse(200, request.body)))
        .connect('https://proxy.svc-staging.plusintegrity.com')
        .then(hostname => http.post(`https://${hostname}/test`, payload).toPromise())
        .then(response => expect(response['ts']).toBe(payload.ts))
        .then(() => service.disconnect())
        .catch(error => fail(error))
        .then(() => done());
    })());

  it('should receive 404 when calling undefined path', (done) =>
    inject([HttpClient, IntegrityProxyService], (http: HttpClient, service: IntegrityProxyService) => {
      service
        .setHandler('/test', () => Promise.resolve(new HttpResponse(200, '"OK"')))
        .removeHandler('/test')
        .connect('https://proxy.svc-staging.plusintegrity.com')
        .then(hostname => http.get(`https://${hostname}/test`).toPromise())
        .then(response => fail(`Received response: ${response}`))
        .then(() => service.disconnect())
        .catch(error => expect(error.status).toBe(404))
        .then(() => done());
    })());

});
