import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
/*
import { CryptoService } from './crypto.service';
import { ConfigService } from './config.service';
import { $WebSocket, WebSocketSendMode } from 'angular2-websocket/angular2-websocket'
*/
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { HttpRequest, HttpResponse, RegistrationRequest, RegistrationResponse } from './models';

@Injectable({
  providedIn: 'root'
})
export class IntegrityProxyService {

  constructor() { }

  ping() {
    console.log('ping');
  }

}
