import { Controller } from '@nestjs/common';
import { ComplyAdvantageService } from './comply-advantage.service';

@Controller('comply-advantage')
export class ComplyAdvantageController {
  constructor(private readonly complyAdvantageService: ComplyAdvantageService) {}
}
