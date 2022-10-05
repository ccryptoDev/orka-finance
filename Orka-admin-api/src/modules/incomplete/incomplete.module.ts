import { Module } from '@nestjs/common';
import { IncompleteService } from './incomplete.service';
import { IncompleteController } from './incomplete.controller';

@Module({
  controllers: [IncompleteController],
  providers: [IncompleteService]
})
export class IncompleteModule {}
