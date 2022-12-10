import { Module } from '@nestjs/common';

import { AddressHelper } from './helpers/address.helper';

@Module({
  providers: [AddressHelper],
  exports: [AddressHelper]
})
export class CommonModule {}
