import { HttpModule, Module } from '@nestjs/common';

import { EquifaxService } from './equifax.service';

@Module({
  imports: [HttpModule],
  providers: [EquifaxService],
  exports: [EquifaxService]
})
export class EquifaxModule {}
