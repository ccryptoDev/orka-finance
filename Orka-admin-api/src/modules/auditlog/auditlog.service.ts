import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class AuditlogService {
    async get(){
        const entityManager = getManager();
        try{
            const rawData = await entityManager.query(`select CONCAT ('LOG_',t.id) as id, CONCAT ('LON_',t3.ref_no) as loan_id, t.module as module, concat(t2.email,' - ',INITCAP(r."name"::text)) as user, t."createdAt" as createdAt from tbllog t join tblloan t3 on t3.id = t.loan_id join tbluser t2 on t2.id = t.user_id join tblroles r on r.id = t2.role order by t."createdAt" desc limit 1000;`);
            //console.log(rawData)
            return {"statusCode": 200, data:rawData };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }

    }
}
