import { Title } from '../../dto/title';

export type BaseTitleGatewayGetInput = {
  imdbId: string;
};

export interface BaseTitleGateway {
  get(input: BaseTitleGatewayGetInput): Promise<Title | null>;
}
