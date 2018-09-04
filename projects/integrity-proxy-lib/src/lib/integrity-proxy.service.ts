import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/websocket';
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

  private _base: string;
  private _id: string;
  private _ws: string;
  private _waiting: any = {};
  private _handlers: any = {};
  private _ready: Promise<any>;
  private _mandateToken: string;

  private jsonConvert: JsonConvert;

  constructor() {
    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null
  }

  public initialize(url: string) {
    this._base = url;
    const ws = url.replace('https://', 'wss://').replace('http://', 'ws://');
    // this.subscribe(`${ws}/proxy/subscribe`);
    this.subscribe('wss://echo.websocket.org');
  }

  private subscribe(url: string) {
    console.log(url);
    const socket$ = webSocket(url);
    // socket$.multiplex().subscribe()
    // const wsSubject = new WebSocketSubject(url);
    socket$.subscribe(
      (message: {}) => console.log('rcv', message),
      (error: any) => console.error('err', error),
      () => console.log('complete')
    );
    socket$.next('hello');
  }

}
