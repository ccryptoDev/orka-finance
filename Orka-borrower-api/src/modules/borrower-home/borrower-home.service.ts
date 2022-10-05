import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class BorrowerHomeService {
  async getBorrowerDetails(id: string) {
    try {
      const entityManager = getManager();
      const customerFinanceDetails = await entityManager.query(
        `
          select
            t2."legalName",
            t2."ownerFirstName",
            t2."ownerLastName",
            t2."ownerEmail",
            t2."owner2FirstName",
            t2."owner2LastName",
            t2."owner2Email",
            t2.email,
            t2."city",
            t2."state",
            t2."zipCode",
            t2."businessPhone",
            t2."businessAddress",
            t1.phase_flag,
            t1.status_flag,
            t1."financingRequested",
            t1."financingTermRequested",
            t2."loanProductID"
          from
            tblloan t1
          join
            tblcustomer t2 on t1.id = t2."loanId"
          where
            t2."loanId" = $1
        `,
        [id]
      );
      const installerInfo = await entityManager.query(
        `
          select
            t3.*
          from
            tblloan t1
          join
            tbluser t2 on t1.ins_user_id = t2.id
          join
            tblinstaller t3 on t2.id = t3.user_id
          where
            t1.id = $1
        `,
        [id]
      )
      const siteProjectDetails = await entityManager.query(
        `
          select
            "city",
            "state",
            "zipCode",
            "businessInstallAddress",
            "businessInstallCity",
            "businessInstallState",
            "businessInstallZipCode",
            "businessInstallLat",
            "businessInstallLng",
            "siteType",
            "electricCompany",
            "avgUtilPerMonth",
            "avgConsumptionPerMonth",
            "arraySize",
            "panelManufacturer",
            "inverterNamePlateCapacity",
            "inverterManufacturer",
            "batteryCapacity",
            "batteryManufacturer",
            "mountType",
            "estGenerationRate",
            "estGeneration",
            "nonSolarEquipmentWork",
            "nonSolarProjectCost",
            "totalProjectCost"
          from
            tblcustomer
          where
            "loanId" = $1
        `,
        [id]
      );
      const activity = await entityManager.query(
        `
          select
            CONCAT ('LOG_',t.id) as id,
            t.module as module,
            concat(t3.email,' - ',INITCAP(t4."name"::text)) as user,
            t."createdAt" as createdAt
          from
            tbllog t
          join
            tblloan t2 on t.loan_id = t2.id
          left join
            tbluser t3 on t3.id = t.user_id
          left join
            tblroles t4 on t4.id = t3."role"
          where
            t.loan_id = $1
        `,
        [id]
      );
      const batteryManufaturer = await entityManager.query(`
        select
          value
        from
          tbldropdown
        where
          mainfield = 'batteryManufacturer'
      `);
      const inverterManufacturer = await entityManager.query(`
        select
          value
        from
          tbldropdown
        where
          mainfield = 'inverterManufacturer'
      `);
      const mountType = await entityManager.query(`
        select
          value
        from
          tbldropdown
        where
          mainfield = 'mountType'
      `);
      const panelManufacturer = await entityManager.query(`
        select
          value
        from
          tbldropdown
        where
          mainfield = 'panelManufacturer'
      `);
      let loaninfo =await entityManager.query(` select *, t3."interestBaseRate",t."originationFee"  from tblloan t left join 
            tblcustomer t2 on t2."loanId" =t."id" 
            left join tblproduct t3 on CAST(t3."productId"  as varchar) =t."productId" where t.id ='${id}'`)
            
      const docusign = await entityManager.query(
        `
          select
            *
          from
            tblloanagreement t
          where
            t."loanId" = $1
        `,
        [id]
      );

      return {
        statusCode: 200,
        customerFinanceDetails,
        installerInfo,
        siteProjectDetails,
        batteryManufaturer,
        inverterManufacturer,
        mountType,
        panelManufacturer,
        activity,
        loaninfo,
        docusign
      }
    } catch (error) {
      console.log(error);

      let resp = new InternalServerErrorException(error).getResponse();

      if (Object.keys(resp).includes('name')) {
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      }
      return {
        statusCode: 500,
        message: [resp],
        error: 'Bad Request'
      };
    }
  }
}
