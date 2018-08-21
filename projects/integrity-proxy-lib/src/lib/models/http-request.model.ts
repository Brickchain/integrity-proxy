import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base64Converter } from '../converters/base64.converter';
import { Base } from './base.model';

@JsonObject
export class HttpRequest extends Base {

  constructor() {
    super('https://proxy.brickchain.com/v1/http-request.json');
  }

  @JsonProperty('url', String, true)
  url: string = undefined;

  @JsonProperty('headers', Any, true)
  headers: any = undefined;

  @JsonProperty('method', String, true)
  method: string = undefined;

  @JsonProperty('body', Base64Converter, true)
  body: string = undefined;

}
