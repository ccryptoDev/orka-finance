import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallingInfoRepository } from 'src/repository/installingInfo.repository';
import { SystemInfoRepository } from 'src/repository/systemInfo.repository';
import { getManager, In } from 'typeorm';

@Injectable()
export class FundedContractsService {

    constructor(
        @InjectRepository(InstallingInfoRepository) private readonly installingInfoRepository:InstallingInfoRepository,
        @InjectRepository(FilesRepository) private readonly filesRepository:FilesRepository,
        @InjectRepository(SystemInfoRepository) private readonly systemInfoRepository:SystemInfoRepository,
        @InjectRepository(CustomerRepository) private readonly customerRepository:CustomerRepository,
    ){}

    async get(){
        const entityManager = getManager();
        try{
            const rawData = await entityManager
            .query(`select 
                        l.id as loan_id, 
                        l.user_id as user_id, 
                        l.ref_no as loan_ref,
                        u.email as email, 
                        u.ref_no as user_ref, 
                        u."firstName" as firstName, 
                        u."lastName" as lastName
                    from tblinstallinginfo ii 
                    join tblloan l on l.id = ii.loan_id 
                    join tbluser u on u.id = l.user_id 
                    where 
                            l.delete_flag = 'N' 
                        and l.active_flag = 'Y' 
                    order by 
                        l."createdAt" desc `);
            
            return {"statusCode": 200, data:rawData };
        }catch (error) {
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getdetails(id){
        try{           
            let data = {}
            data['customerDetails'] = await this.customerRepository.findOne({select:['loanId'],where:{loanId: id}});
            data['ownershipFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/fileUpload', delete_flag:'N'}});
            data['systemInfo'] = await this.systemInfoRepository.findOne({where:{loan_id: id}});
            data['installingInfo'] = await this.installingInfoRepository.findOne({where:{loan_id: id}});
            data['milestone1ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone1Req', delete_flag:'N'}});
            data['milestone2ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone2Req', delete_flag:'N'}});
            data['milestone3ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone3Req', delete_flag:'N'}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
