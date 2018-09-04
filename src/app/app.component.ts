import { Component } from '@angular/core';
import { IntegrityProxyService } from 'integrity-proxy-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'integrity-proxy-app';
  constructor(proxy: IntegrityProxyService) {
    proxy.initialize('https://proxy.svc-staging.plusintegrity.com');
  }
}
