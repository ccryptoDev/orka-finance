import { Injectable,InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsRepository } from '../../repository/questions.repository';
import {Flags,Questions,Condition,Type} from '../../entities/question.entity';
import {CreateQuestionsDto} from './dto/create-questions.dto';
import {UpdateQuestionsDto} from './dto/update-questions.dto';
import { SettingsRepository } from 'src/repository/settings.repository';
import { SettingsEntity } from 'src/entities/settings.entity';

@Injectable()
export class QuestionsService {
  constructor( 
    @InjectRepository(QuestionsRepository) private readonly questionsRepository: QuestionsRepository,
    @InjectRepository(SettingsRepository) private readonly settingsRepository: SettingsRepository,
  ) {}

  async findAll() {
    try {
      let data = {}
      data['question'] = await this.questionsRepository.find( {select:["id","question","type","condition","approvedif"], where:{delete_flag:'N'}});
      data['showQuestions'] = await this.settingsRepository.findOne({select:["value"],where:{key:'showQuestions'}})
      
      if(!data['showQuestions']){
        let settingsEntity = new SettingsEntity();
        settingsEntity.key = 'showQuestions';
        settingsEntity.value = 'false';

        data['showQuestions'] = await this.settingsRepository.save(settingsEntity);        
      }      
      return {"statusCode": 200, data: data} 
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteQuestionById(id: string){
    try{
      await this.questionsRepository.update({id: id}, { delete_flag: Flags.Y });
      return {"statusCode": 200}
    } catch (error) {
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async update(UpdateQuestionsDto:UpdateQuestionsDto){
    try{
      let question = new Questions();
      question.approvedif = UpdateQuestionsDto.approvedif;
      question.question = UpdateQuestionsDto.question;
      
      switch (UpdateQuestionsDto.condition) {
        case '=':
          question.condition = Condition.con1
          break;
        case '>':
          question.condition = Condition.con2
          break;
        case '<':
          question.condition = Condition.con3
          break;
        case '>=':
          question.condition = Condition.con4
          break;
        case '<=':
          question.condition = Condition.con5
          break;
      }

      switch (UpdateQuestionsDto.type) {
        case 'Yes_or_no':
          question.type = Type.Yes_or_no
          break;
        case 'Value':
          question.type = Type.Value
          break;
        case 'Free_style':
          question.type = Type.Free_style
          break;
      }
      await this.questionsRepository.update({id: UpdateQuestionsDto.id}, question);
      return {"statusCode": 200}
    } catch (error) {
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async save(CreateQuestionsDto:CreateQuestionsDto){
    try{
      let question = new Questions();
      question.approvedif = CreateQuestionsDto.approvedif;
      question.question = CreateQuestionsDto.question;
      
      switch (CreateQuestionsDto.condition) {
        case '=':
          question.condition = Condition.con1
          break;
        case '>':
          question.condition = Condition.con2
          break;
        case '<':
          question.condition = Condition.con3
          break;
        case '>=':
          question.condition = Condition.con4
          break;
        case '<=':
          question.condition = Condition.con5
          break;
      }

      switch (CreateQuestionsDto.type) {
        case 'Yes_or_no':
          question.type = Type.Yes_or_no
          break;
        case 'Value':
          question.type = Type.Value
          break;
        case 'Free_style':
          question.type = Type.Free_style
          break;
      }
      await this.questionsRepository.save(question)
      return {"statusCode": 200}
    } catch (error) {
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async toggleShowQuestions(toggleValue){
    try{
        await this.settingsRepository.update({key: 'showQuestions'},{value: (toggleValue.value)})
        return {"statusCode": 200,  };            
    }catch(error){
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
}

}
