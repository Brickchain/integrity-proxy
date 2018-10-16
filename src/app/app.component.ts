import { Component } from '@angular/core';
import { IntegrityProxyService } from 'integrity-proxy-lib';
import { HttpRequest, HttpResponse } from 'integrity-proxy-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'integrity-proxy-app';
  hostname: string;
  base: string;
  constructor(proxy: IntegrityProxyService) {
    proxy
      .setHandler('/test', (request: HttpRequest) => {
        console.log(request);
        return Promise.resolve(new HttpResponse(200, '"OK"'));
      })
      .connect('https://proxy.svc-staging.plusintegrity.com')
      .then(hostname => this.hostname = hostname)
      .then(base => this.base = proxy.base);
  }
}
