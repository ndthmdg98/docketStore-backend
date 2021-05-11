export class Config {
  public static readonly hostname: string = 'localhost';
  public static readonly port: string = '3000';
  public static protocol = 'http://';
  public static baseUrl =  Config.protocol + Config.hostname + ':' + Config.port;
}





export class JwtConfig {
  public static readonly jwtSecret = "ILovePokemon"
}
