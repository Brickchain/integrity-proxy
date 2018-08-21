import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { v4 } from 'uuid/v4';

@JsonObject
export class Base {

  constructor(type: string = 'https://schema.brickchain.com/v2/base.json') {
    this.type = type;
    this.id = v4();
  }

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('@timestamp', DateConverter, true)
  timestamp: Date = undefined;

  @JsonProperty('@id', String, true)
  id: string = undefined;

  @JsonProperty('@certificate', String, true)
  certificate: string = undefined;

  @JsonProperty('@realm', String, true)
  realm: string = undefined;

}
