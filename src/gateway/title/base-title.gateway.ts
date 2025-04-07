import { Title } from '../../dto/title';
import { TitleIdValueObject } from '../../value-object/title-id.vo';

export type BaseTitleGatewayGetInput = {
  imdbId: TitleIdValueObject;
};

export interface BaseTitleGateway {
  get(input: BaseTitleGatewayGetInput): Promise<Title | null>;
}

export const BaseTitleGateway = Symbol.for('BaseTitleGateway');
