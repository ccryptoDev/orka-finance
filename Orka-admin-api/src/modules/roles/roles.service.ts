
import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PortalRepository } from '../../repository/portal.repository';
import { PagesRepository } from '../../repository/pages.repository';
import { PagetabsRepository } from '../../repository/pagetabs.repository';
import { RolesRepository } from '../../repository/roles.repository';
import { RolesmasterRepository } from '../../repository/rolesmaster.repository';
import {Addroles} from './dto/addrole.dto';
import {Updateroles} from './dto/updaterole.dto';
import {Addpermission} from './dto/addpermission.dto';
import {Roles,Flags} from '../../entities/roles.entity';
import {Rolesmaster} from '../../entities/rolesmaster.entity';
import { getManager } from 'typeorm';
@Injectable()
export class RolesService {

    constructor( 
        @InjectRepository(PortalRepository) private readonly portalRepository: PortalRepository,
        @InjectRepository(PagesRepository) private readonly pagesRepository: PagesRepository,
        @InjectRepository(PagetabsRepository) private readonly pagetabsRepository: PagetabsRepository,
        @InjectRepository(RolesRepository) private readonly rolesRepository: RolesRepository,
        @InjectRepository(RolesmasterRepository) private readonly rolesmasterRepository: RolesmasterRepository,
      ) {}

    async getShortName()
    {
        try{
            let entityManager = getManager();
            let rawData = await entityManager.query(`select distinct "businessShortName", "businessName","businessEmail" from tblinstaller`)
            return {"statusCode":200,data:rawData}
        }
        catch(error)
        {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async addroles(addroles: Addroles){
        try{
            if(addroles.name.trim().length==0){
                return {"statusCode": 400, "message": "Name should not be empty","error": "Bad Request"}
              }else{
                let count = await this.rolesRepository.count( {select:["id"], where:{delete_flag:Flags.N,name:addroles.name.toLocaleLowerCase()}})
                if(count==0){
                    let roles = new Roles();
                    roles.name = addroles.name.toLocaleLowerCase()
                    await this.rolesRepository.save(roles);
                }                
              }               
              return {"statusCode": 200,message:'Role Added Successfully'}
        } catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async updateroles(updateroles: Updateroles){
        try{
            if(updateroles.name.trim().length==0){
                return {"statusCode": 400, "message": "Name should not be empty","error": "Bad Request"}
              }
              await this.rolesRepository.update({id: updateroles.id,edit_flag:Flags.Y},{name:updateroles.name})
              return {"statusCode": 200}
        } catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }


    async delete(id){
        try{
              await this.rolesRepository.update({id: id,edit_flag:Flags.Y},{delete_flag:Flags.Y})
              return {"statusCode": 200}
        } catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async addpermission(addpermission:Addpermission){
        try{
            let count = await this.rolesRepository.count( {select:["id"], where:{delete_flag:Flags.N,edit_flag:Flags.Y,id:addpermission.id}})
            if(count==1){
                this.rolesmasterRepository.update({role_id:addpermission.id},{delete_flag:Flags.Y})
                let rolesmasterlist = []
                for (let i = 0; i < addpermission.ids.length; i++) {
                    let rolesmaster = new Rolesmaster()
                    rolesmaster.role_id = addpermission.id;
                    rolesmaster.portal_id = addpermission.ids[i].portal_id
                    rolesmaster.pages_id = addpermission.ids[i].pages_id
                    rolesmaster.pagetabs_id = addpermission.ids[i].pagetabs_id
                    rolesmasterlist.push(rolesmaster)
                }
                if(rolesmasterlist.length>0){
                    this.rolesmasterRepository.save(rolesmasterlist)
                }
            }
            return {"statusCode": 200}
      } catch (error) {
          console.log(error)
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
    }


    async getmenulist(id){
        try{
            const entityManager = getManager();
            const list = await entityManager.query(`select t.id as portal_id, t2.id as pages_id, t3.id as pagetabs_id, t3.id as id, t."name" as portal_name, t2."name" as pagesname, t3."name" as pagestabsname, t3."name" as "itemName" from tblportal t 
            join tblpages t2 on t2.portal_id = t.id
            left join tblpagetabs t3 on t3.pages_id = t2.id
            where t.delete_flag = 'N' 
            and t2.delete_flag = 'N' 
            and t3.delete_flag = 'N'
            and t.active_flag = 'Y' 
            and t2.active_flag = 'Y' 
            and t3.active_flag = 'Y'`);
            const select = await entityManager.query(`select t.id as portal_id, t2.id as pages_id, t3.id as pagetabs_id, t3.id as id, t."name" as portal_name, t2."name" as pagesname, t3."name" as pagestabsname, t3."name" as "itemName" from tblportal t 
            join tblpages t2 on t2.portal_id = t.id
            left join tblpagetabs t3 on t3.pages_id = t2.id
            join tblrolesmaster t4 on t4.pagetabs_id = t3.id
            where t.delete_flag = 'N' 
            and t2.delete_flag = 'N' 
            and t3.delete_flag = 'N'
            and t.active_flag = 'Y' 
            and t2.active_flag = 'Y' 
            and t3.active_flag = 'Y'
            and t4.delete_flag = 'N'
            and t4.role_id = ${id}`);
            return {"statusCode": 200,data:{list:list,select:select}}
        } catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getroles(){
        try{
            let list = await this.rolesRepository.find( {select:["id","name","edit_flag"], where:{delete_flag:Flags.N},order:{createdAt:'DESC'}})
            return {"statusCode": 200,data:list}
      } catch (error) {
          console.log(error)
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
    }

    async checkpermission(id){
        try{
        let data = await this.rolesRepository.find( {select:["id","name"], where:{delete_flag:Flags.N,edit_flag:Flags.Y,id:id}})
        return {"statusCode": 200,data:data}
        } catch (error) {
            console.log(error)
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getAdminPortalRoles(){
        try{            
            const entityManager = getManager();
            const list = await entityManager.
                query(`select distinct 
                        r.id, 
                        r.name
                    from tblroles r
                    join tblrolesmaster rm on r.id = rm.role_id 
                    join tblportal p on p.id = rm.portal_id 
                    where 
                        p.name = 'admin'
                    and r.delete_flag ='N' 
                    order by r.id asc
                `)
            return {"statusCode": 200,data:list}
      } catch (error) {
          console.log(error)
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
    }
}
