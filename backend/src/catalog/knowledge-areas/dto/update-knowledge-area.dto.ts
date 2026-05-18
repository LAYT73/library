import { PartialType } from '@nestjs/swagger';
import { CreateKnowledgeAreaDto } from './create-knowledge-area.dto';

export class UpdateKnowledgeAreaDto extends PartialType(
  CreateKnowledgeAreaDto,
) {}
