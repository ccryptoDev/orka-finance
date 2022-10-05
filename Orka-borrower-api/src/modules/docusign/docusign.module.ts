import { CacheModule, Module } from '@nestjs/common';
import { DocusignService } from './docusign.service';

@Module({
  imports: [CacheModule.register()],
  providers: [DocusignService],
  exports: [DocusignService],
})
export class DocusignModule {}
