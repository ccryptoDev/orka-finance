

import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {NotificationRepository} from '../../repository/notification.repository';
import {Flags} from '../../entities/notification.entity';
@Injectable()
export class NotificationService {//check 

    constructor(
        @InjectRepository(NotificationRepository) private readonly notificationRepository: NotificationRepository,
      ){
    
      }
    async gettop(){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`SELECT title, message, link, to_char("createdAt" , 'DD-MM-YYYY') as "createdAt" FROM tblnotification where adminview = 'N' order by "createdAt" desc limit 5`);
            //console.log(rawData)
            return {"statusCode": 200, data:rawData };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }

    async getall(){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`SELECT title, message, link, to_char("createdAt" , 'DD-MM-YYYY  HH24:MI:SS') as "createdAt" FROM tblnotification where adminview = 'N' order by "createdAt" desc`);
            //console.log(rawData)
            return {"statusCode": 200, data:rawData };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async viewed(){
        try{
            await this.notificationRepository.update({adminview:Flags.N},{adminview:Flags.Y})
            return {"statusCode": 200 };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
