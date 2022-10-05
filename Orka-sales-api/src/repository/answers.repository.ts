import { EntityRepository, Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';

@EntityRepository(Answer)
export class AnswersRepository extends Repository<Answer> {}
