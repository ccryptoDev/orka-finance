import { PartialType } from '@nestjs/swagger';
import { CreateCounterSignatureDto } from './create-counter-signature.dto';

export class UpdateCounterSignatureDto extends PartialType(CreateCounterSignatureDto) {}
