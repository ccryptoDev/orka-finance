import { Controller } from '@nestjs/common';
import { MiddeskService } from './middesk.service';

@Controller('middesk')
export class MiddeskController {
  constructor(private readonly middeskService: MiddeskService) {}
}
