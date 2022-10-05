import { Injectable,InternalServerErrorException  } from '@nestjs/common';
import { getManager } from 'typeorm';
import {ProductEntity,LoanProdStatus} from 'src/entities/products.entity'
import {LogEntity} from 'src/entities/log.entity'
import {Installer} from 'src/entities/installer.entity'
import {PartnerProductEntity} from 'src/entities/partnerProducts.entity'
import { UserEntity} from '../../entities/users.entity';
import { ProductRepository } from 'src/repository/products.repository';
import { PartnerProductRepository } from 'src/repository/partnerProduct.repository'; 
import { DisbursementSequence } from 'src/repository/disbursementSequence.repository';
import { LogRepository} from '../../repository/log.repository';
import { UserRepository} from '../../repository/users.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Flags,disbursementStatus } from 'src/configs/config.enum';
import { LogsService } from 'src/common/logs/logs.service';
import { ActiveDeactiveDto } from './dto/active-deactive.dto';

import { setFlagsFromString } from 'v8';
import { CreateDisbursementSequenceDto } from './dto/create-disbursement-sequence.dto';
import { UpdateDisbursementSequenceDto } from './dto/update-disbursement-sequence.dto';
import { DisbursementEntity } from 'src/entities/disbursementSequence.entity';

@Injectable()
export class DisbursementSequenceService {
  constructor(
    @InjectRepository(ProductRepository) private readonly loanProductRepository:ProductRepository,
    @InjectRepository(InstallerRepository) private readonly installerRepository:InstallerRepository,
    @InjectRepository(PartnerProductRepository) private readonly partnerLoanProductRepository:PartnerProductRepository,
    @InjectRepository(ProductRepository) private readonly productsRepositary:ProductRepository,
    @InjectRepository(DisbursementSequence) private readonly DisbursementSequence:DisbursementSequence,
    private readonly logsService: LogsService,
  ){}


  async add(CreateDisbursementSequenceDto: CreateDisbursementSequenceDto) {
    try {

   
        const disbursement = new DisbursementEntity

        disbursement.name =CreateDisbursementSequenceDto.name;
        disbursement.total_disbs =CreateDisbursementSequenceDto.total_disbs;
        disbursement.m1_percent =CreateDisbursementSequenceDto.m1_percent;
        disbursement.m2_percent =CreateDisbursementSequenceDto.m2_percent;
        disbursement.m3_percent =CreateDisbursementSequenceDto.m3_percent;
        disbursement.m4_percent =CreateDisbursementSequenceDto.m4_percent;
        disbursement.m5_percent =CreateDisbursementSequenceDto.m5_percent;
      
        disbursement.m1_type =(CreateDisbursementSequenceDto.m1_type=='equipment_permit')? disbursementStatus.equipment_permit : (CreateDisbursementSequenceDto.m1_type=='construction') ? disbursementStatus.construction :(CreateDisbursementSequenceDto.m1_type=='commercial_operation') ? disbursementStatus.commercial_operation:(CreateDisbursementSequenceDto.m1_type=='type4') ?disbursementStatus.type4: (CreateDisbursementSequenceDto.m1_type=='type5')?disbursementStatus.type5:null
        disbursement.m2_type = (CreateDisbursementSequenceDto.m2_type=='equipment_permit')? disbursementStatus.equipment_permit : (CreateDisbursementSequenceDto.m2_type=='construction') ? disbursementStatus.construction :(CreateDisbursementSequenceDto.m2_type=='commercial_operation') ? disbursementStatus.commercial_operation:(CreateDisbursementSequenceDto.m2_type=='type4') ?disbursementStatus.type4: (CreateDisbursementSequenceDto.m2_type=='type5')?disbursementStatus.type5:null
        disbursement.m3_type = (CreateDisbursementSequenceDto.m3_type=='equipment_permit')? disbursementStatus.equipment_permit : (CreateDisbursementSequenceDto.m3_type=='construction') ? disbursementStatus.construction :(CreateDisbursementSequenceDto.m3_type=='commercial_operation') ? disbursementStatus.commercial_operation:(CreateDisbursementSequenceDto.m3_type=='type4') ?disbursementStatus.type4: (CreateDisbursementSequenceDto.m3_type=='type5')?disbursementStatus.type5:null
        disbursement.m4_type = (CreateDisbursementSequenceDto.m4_type=='equipment_permit')? disbursementStatus.equipment_permit : (CreateDisbursementSequenceDto.m4_type=='construction') ? disbursementStatus.construction :(CreateDisbursementSequenceDto.m4_type=='commercial_operation') ? disbursementStatus.commercial_operation:(CreateDisbursementSequenceDto.m4_type=='type4') ?disbursementStatus.type4: (CreateDisbursementSequenceDto.m4_type=='type5')?disbursementStatus.type5:null
        disbursement.m5_type = (CreateDisbursementSequenceDto.m5_type=='equipment_permit')? disbursementStatus.equipment_permit : (CreateDisbursementSequenceDto.m5_type=='construction') ? disbursementStatus.construction :(CreateDisbursementSequenceDto.m5_type=='commercial_operation') ? disbursementStatus.commercial_operation:(CreateDisbursementSequenceDto.m5_type=='type4') ?disbursementStatus.type4: (CreateDisbursementSequenceDto.m5_type=='type5')?disbursementStatus.type5:null
      

        //console.log('data',disbursement)
        this.DisbursementSequence.save(disbursement);

        return {
            statusCode: 200,
            message: "Disbursement sequence Saved",
        }

    }catch (error) {
        console.log(error)
        return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };      
    }
}

async get(){
  const entityManager = getManager();
  try{
      const rawData = await entityManager.query(`select * from tbldisbsequence order by "createdAt" desc `);
      console.log(rawData)
      return {"statusCode": 200, data:rawData };
  }catch (error) {
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
  }

}
  async getDisbursementSequence(id)
    {
        try{
            let disbursement:any = await this.DisbursementSequence.find({where:{ref_no:id}});
          
            return {
                statusCode:200,
                data:disbursement
            }
        }
        catch(error)
        {
            console.log(error);
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

  async putEditDetails(UpdateDisbursementSequenceDto: UpdateDisbursementSequenceDto) {
    try {

      const disbursementInfo: any = await this.DisbursementSequence.update({ref_no: UpdateDisbursementSequenceDto.id},
        {
          name:UpdateDisbursementSequenceDto.name,
          total_disbs:UpdateDisbursementSequenceDto.total_disbs,
          m1_percent:UpdateDisbursementSequenceDto.m1_percent,
          m2_percent:UpdateDisbursementSequenceDto.m2_percent,
          m3_percent:UpdateDisbursementSequenceDto.m3_percent,
          m4_percent:UpdateDisbursementSequenceDto.m4_percent,
          m5_percent:UpdateDisbursementSequenceDto.m5_percent,

          m1_type :(UpdateDisbursementSequenceDto.m1_type=='equipment_permit')?disbursementStatus.equipment_permit: (UpdateDisbursementSequenceDto.m1_type=='construction') ?disbursementStatus.construction:(UpdateDisbursementSequenceDto.m1_type=='commercial_operation')?disbursementStatus.commercial_operation:(UpdateDisbursementSequenceDto.m1_type=='type4')?disbursementStatus.type4:(UpdateDisbursementSequenceDto.m1_type=='type5')?disbursementStatus.type5:null,
          m2_type :(UpdateDisbursementSequenceDto.m2_type=='equipment_permit')?disbursementStatus.equipment_permit: (UpdateDisbursementSequenceDto.m2_type=='construction') ?disbursementStatus.construction:(UpdateDisbursementSequenceDto.m2_type=='commercial_operation')?disbursementStatus.commercial_operation:(UpdateDisbursementSequenceDto.m2_type=='type4')?disbursementStatus.type4:(UpdateDisbursementSequenceDto.m2_type=='type5')?disbursementStatus.type5:null,
          m3_type :(UpdateDisbursementSequenceDto.m2_type=='equipment_permit')?disbursementStatus.equipment_permit: (UpdateDisbursementSequenceDto.m3_type=='construction') ?disbursementStatus.construction:(UpdateDisbursementSequenceDto.m3_type=='commercial_operation')?disbursementStatus.commercial_operation:(UpdateDisbursementSequenceDto.m3_type=='type4')?disbursementStatus.type4:(UpdateDisbursementSequenceDto.m3_type=='type5')?disbursementStatus.type5:null,
          m4_type :(UpdateDisbursementSequenceDto.m2_type=='equipment_permit')?disbursementStatus.equipment_permit: (UpdateDisbursementSequenceDto.m4_type=='construction') ?disbursementStatus.construction:(UpdateDisbursementSequenceDto.m4_type=='commercial_operation')?disbursementStatus.commercial_operation:(UpdateDisbursementSequenceDto.m4_type=='type4')?disbursementStatus.type4:(UpdateDisbursementSequenceDto.m4_type=='type5')?disbursementStatus.type5:null,
          m5_type :(UpdateDisbursementSequenceDto.m2_type=='equipment_permit')?disbursementStatus.equipment_permit: (UpdateDisbursementSequenceDto.m5_type=='construction') ?disbursementStatus.construction:(UpdateDisbursementSequenceDto.m5_type=='commercial_operation')?disbursementStatus.commercial_operation:(UpdateDisbursementSequenceDto.m5_type=='type4')?disbursementStatus.type4:(UpdateDisbursementSequenceDto.m5_type=='type5')?disbursementStatus.type5:null,

        }
      )

        
        return {
            statusCode: 200,
            message: "Disbursement sequence updated",
            data: [disbursementInfo]
        }
    }catch(error){
        console.log(error);
        return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
}



  async getLogs(installerId){
    try{
        let entityManager = getManager();
        let logs:any = await entityManager.query(`select CONCAT ('LOG_',t.id) as id,t.installer_id, t.activity , concat(t2.email,' - ',INITCAP(r."name"::text)) as user, t."createdAt" as createdAt from tblproductlog t  join tbluser t2 on t2.id = t.user_id join tblroles r on r.id = t2.role where t.installer_id  = '${installerId}' order by t."createdAt" desc;` )
        return {
            statusCode:200,
            data:logs
        }
    }
    catch(error)
    {
        console.log(error);
        return { "statusCode": 500, "message": ["Invalid UUID"], "error": "Bad Request" };
    }
}

async disbursementactivateDeactivate(ActiveDeactiveDto:ActiveDeactiveDto){

  const disbursementInfo: any = await this.DisbursementSequence.update({disbursementSequenceId: ActiveDeactiveDto.id},
    {
      status:ActiveDeactiveDto.status
    }
  )
  let status = (ActiveDeactiveDto.status=='ACTIVE')?'Disbursement sequence Enabled':'Disbursement sequence Disabled'
  return {
    statusCode:200,
    data:disbursementInfo,
    message: status
  }
}
  
}
