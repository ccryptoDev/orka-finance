import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesEntity, Flags } from 'src/entities/files.entity';
import { Installer } from 'src/entities/installer.entity';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { UserRepository } from 'src/repository/users.repository';
import { getManager } from 'typeorm';
import { EditProfileDto, EditSubInstallerDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
        @InjectRepository(InstallerRepository) private readonly installerRepository: InstallerRepository,
        @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    ){}

    async editProfile(editProfileDto: EditProfileDto){        
        try{
            let data={}
            data['installerDetails'] = await this.installerRepository.findOne({where:{user_id:editProfileDto.user_id}});
            
            if(!data['installerDetails']){
                let installer = new Installer();

                // installer.user_id = editProfileDto.user_id,
                // installer.firstName = editProfileDto.firstName
                // installer.lastName = editProfileDto.lastName
                // // installer.birthday = editProfileDto.birthday
                // installer.email = editProfileDto.email
                // installer.phone = editProfileDto.phone
                // installer.streetAddress = editProfileDto.streetAddress
                // installer.unit = editProfileDto.unit
                // installer.city = editProfileDto.city
                // installer.state = editProfileDto.state
                // installer.zipCode = editProfileDto.zipCode
                
                // await this.installerRepository.save(installer);
                return { "statusCode": 200}
            }else{
                // await this.installerRepository.update({user_id:editProfileDto.user_id},{
                //     firstName : editProfileDto.firstName,
                //     lastName : editProfileDto.lastName,
                //     // birthday : editProfileDto.birthday,
                //     email : editProfileDto.email,
                //     phone : editProfileDto.phone,
                //     streetAddress : editProfileDto.streetAddress,
                //     unit : editProfileDto.unit,
                //     city : editProfileDto.city,
                //     state : editProfileDto.state,
                //     zipCode : editProfileDto.zipCode
                // });                
                return { "statusCode": 200, "message":['Profile details saved successfully']}
            }
        } catch (error) {
            console.log(error)
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async editSubInstaller(editSubInstallerDto:EditSubInstallerDto){        
        try{  
            await this.userRepository.update({id:editSubInstallerDto.user_id},{
                firstName : editSubInstallerDto.firstName,
                lastName : editSubInstallerDto.lastName,
            });                
            return { "statusCode": 200, "message":['Profile details saved successfully']}
            
        } catch (error) {
            console.log(error)
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async saveProfileImage(id, files) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/profileImage';
            file.link_id = id;
            filedata.push(file)
        }
        try{
            let data={}
            data['checkProfileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage', delete_flag:Flags.N}});
            if(data['checkProfileImage']){
                await this.filesRepository.update({link_id:id, services:'installer/profileImage'},{
                    delete_flag: Flags.Y
                });
            }            
            await this.filesRepository.save(filedata);
            return { "statusCode": 200, data: files[0].filename}
        } catch (error) {
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async removeProfileImage(id) {        
        try{
            let data={}
            data['checkProfileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage', delete_flag:Flags.N}});
            if(data['checkProfileImage']){
                await this.filesRepository.update({link_id:id, services:'installer/profileImage'},{
                    delete_flag: Flags.Y
                });
            } 
            return { "statusCode": 200}
        } catch (error) {
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async getProfileDetails(id){
        const entityManager = getManager();
        try{            
            let data = {}         
            data['profileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage',delete_flag:'N'}});            
            data['profileDetails'] = await this.installerRepository.findOne({where:{user_id:id}});
            if(data['profileDetails']==undefined){
                data['profileDetails'] = await this.userRepository.findOne({where:{id:id}});
            }
            data['profileStatistics'] = await entityManager.query("select status, count(status) as statusCount from tblinstallinginfo ii where ii.user_id='"+id+"' group by status")          
            return {"statusCode": 200, data:data };            
        }catch(error){
            console.log('err', error);
            
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 
    
    async getProfileSettings(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['profileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage',delete_flag:'N'}});            
            data['profileSettings'] = await this.installerRepository.findOne({where:{user_id:id}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 

    async getSubInstallerProfile(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['profileImage'] = await this.filesRepository.findOne({where:{link_id:id, services:'installer/profileImage',delete_flag:'N'}});            
            data['profileSettings'] = await this.userRepository.findOne({where:{id:id}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 
}
