import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base64Converter } from '../converters/base64.converter';
import { Base } from './base.model';

@JsonObject
export class HttpResponse extends Base {

  constructor(status?: number, body?: string, contentType?: string, id?: string) {
    super('https://proxy.brickchain.com/v1/http-response.json');
    this.status = status;
    this.body = body;
    this.contentType = contentType;
    this.id = id;
  }

  @JsonProperty('headers', Any, true)
  headers: any = undefined;

  @JsonProperty('contentType', String, true)
  contentType: string = undefined;

  @JsonProperty('status', Number, true)
  status: number = undefined;

  @JsonProperty('body', Base64Converter, true)
  body: string = undefined;

}
