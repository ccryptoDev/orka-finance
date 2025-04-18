import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  @IsString()
  public_token: string;

  @IsBoolean()
  reconnect: boolean;
}
