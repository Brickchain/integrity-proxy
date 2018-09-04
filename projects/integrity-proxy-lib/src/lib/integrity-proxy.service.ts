import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/websocket';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { MandateToken, HttpRequest, HttpResponse, RegistrationRequest, RegistrationResponse } from './models';
import { v4 } from 'uuid/v4';
import * as jose from 'node-jose';

@Injectable({
  providedIn: 'root'
})
export class IntegrityProxyService {

  private socket$: WebSocketSubject<{}>;
  private handlers: { [path: string]: (request: HttpRequest) => Promise<HttpResponse>; } = {};
  private resolve: (value?: string | PromiseLike<string>) => void;

  private keystore;
  private jsonConvert: JsonConvert;

  constructor() {

    this.keystore = jose.JWK.createKeyStore();

    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null

  }

  public connect(url: string, signedMandateToken?: string): Promise<string> {
    const subscribeUrl = url.replace('https://', 'wss://').replace('http://', 'ws://') + '/proxy/subscribe';
    this.socket$ = webSocket(subscribeUrl);
    return new Promise<string>((resolve, reject) => {
      this.resolve = resolve;
      this.createRegistrationRequest(url, signedMandateToken)
        .then(request => this.socket$
          .multiplex(
            () => request,
            () => 'close',
            (value: {}) => { console.log(value); return true; })
          .subscribe(
            (message: {}) => this.onMessage(message),
            (error: any) => reject(error)));
    });
  }

  private async createRegistrationRequest(url: string, signedMandateToken?: string): Promise<string> {

    if (!signedMandateToken) {

      const mandateToken = new MandateToken();
      mandateToken.timestamp = new Date();
      mandateToken.uri = url;
      mandateToken.mandates = [];
      mandateToken.ttl = 60;

      const key = await this.keystore.generate('EC', 'P-256');

      signedMandateToken = await jose.JWS.createSign({ format: 'compact' }, { key: key, reference: 'jwk' })
        .update(JSON.stringify(this.jsonConvert.serializeObject(mandateToken)), 'utf8')
        .final();

    }

    const registrationRequest = new RegistrationRequest();
    registrationRequest.mandateToken = signedMandateToken;
    registrationRequest.session = v4();

    return this.jsonConvert.serializeObject(registrationRequest);

  }

  private onMessage(message: {}) {
    switch (message['@type']) {
      case 'https://proxy.brickchain.com/v1/ping.json':
        break;
      case 'https://proxy.brickchain.com/v1/registration-response.json':
        const registrationResponse = <RegistrationResponse>this.jsonConvert.deserializeObject(message, RegistrationResponse);
        this.resolve(registrationResponse.hostname);
        break;
      case 'https://proxy.brickchain.com/v1/http-request.json':
        const req = <HttpRequest>this.jsonConvert.deserializeObject(message, HttpRequest);
        if (this.handlers[req.url] !== undefined) {
          if (req.method === 'OPTIONS') {
            const res = new HttpResponse(200, 'OK', req.id);
            res.headers = {
              'Access-Control-Allow-Origin': req.headers['Origin'],
              'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type'
            };
            this.socket$.next(this.jsonConvert.serializeObject(res));
          } else {
            this.handlers[req.url](req).then((res: HttpResponse) => {
              res.id = req.id;
              res.headers = {
                'Access-Control-Allow-Origin': req.headers['Origin'],
                'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type'
              };
              this.socket$.next(this.jsonConvert.serializeObject(res));
            });
          }
        } else {
          const res = new HttpResponse(404, 'Not found', req.id);
          this.socket$.next(this.jsonConvert.serializeObject(res));
        }
        break;
      default:
        console.warn('Unsupported message type', message);
        break;
    }
  }

  public handlePath(path: string, handler: (request: HttpRequest) => Promise<HttpResponse>): IntegrityProxyService {
    this.handlers[path] = handler;
    return this;
  }

}
