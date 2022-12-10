import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../configs.constants';

const typeOrmConfig: TypeOrmModule = {
  type: databaseConfig.type,
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  entities: [`${__dirname}/../../**/*.entity.{js,ts}`],
  migrations: [`${__dirname}/../../../migrations/*.js`],
  migrationsRun: true
};

export default typeOrmConfig;
