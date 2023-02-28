import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { getManager } from 'typeorm';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
  ItemPublicTokenExchangeRequest,
  InstitutionsGetByIdRequest,
  IdentityGetRequest,
  TransactionsGetRequest,
  AssetReportGetRequest
} from 'plaid';

import { LoanRepository } from '../../repository/loan.repository';
import { BankAccounts } from '../../entities/bankAccounts.entity';
import { Flags } from '../../entities/bankAccounts.entity';
import { BankTransactions } from '../../entities/bankTransactions.entity';
import { BankAccountsRepository } from '../../repository/bankAccounts.repository';
import { BankTransactionsRepository } from '../../repository/bankTranscations.repository';
import { CustomerRepository } from '../../repository/customer.repository';
import { MailService } from '../../mail/mail.service';
import { PlaidMasterRepository } from '../../repository/plaidMaster.repository';
import { PlaidMasterEntity } from '../../entities/plaidMaster.entity';
import { HistoricalBalanceEntity } from '../../entities/historicalBalance.entity';
import { HistoricalBalanceRepository } from '../../repository/historicalBalance.repository';
import { PlaidAuthEntity } from '../../entities/plaidAuth.entity';
import { PlaidAuthRepository } from '../../repository/plaidAuth.repository';

config();

@Injectable()
export class PlaidService {
  plaidConfig: {} = {
    basePath: process.env.PLAID_ENV=='production'?PlaidEnvironments.production:PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENTID,
        'PLAID-SECRET': process.env.PLAID_SECRETKEY
      },
    },
  };

  constructor(
    @InjectRepository(BankAccountsRepository) private readonly bankAccountsRepository: BankAccountsRepository,
    @InjectRepository(BankTransactionsRepository) private readonly bankTransactionsRepository: BankTransactionsRepository,
    @InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository,
    @InjectRepository(LoanRepository) private readonly loanRepository:LoanRepository,
    @InjectRepository(PlaidMasterRepository) private readonly plaidMasterRepository:PlaidMasterRepository,
    @InjectRepository(HistoricalBalanceRepository) private readonly historicalBalanceRepository:HistoricalBalanceRepository,
    @InjectRepository(PlaidAuthRepository) private readonly pladiAuthRepository:PlaidAuthRepository,
    private readonly mailService: MailService
  ) {}

  async linkToken(id)
  {
    try{
    const configuration = new Configuration(this.plaidConfig)
    const client = new PlaidApi(configuration)
    const response = await client.linkTokenCreate({
      client_name: process.env.PLAID_CLIENT_NAME,
      products: [Products.Auth, Products.Assets, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      user: { client_user_id:id },
    });
    //log service should be written
    return {
      statusCode: 200,
      token: response.data.link_token,
      data: response.data,
    };
    }catch(error)
    {
      return error;
      console.log(error)
    }
  }

  async savetoken(loan_id, public_token) {
  const entityManager = getManager();
  try {
    //token exechange with plaid
    const configuration = new Configuration(this.plaidConfig);

    console.log("Check TokenPublic",public_token)
    let token: ItemPublicTokenExchangeRequest = {
      public_token: public_token,
    };

    const client = new PlaidApi(configuration);
    const response = await client.itemPublicTokenExchange(token);

    const access_token = response.data.access_token;
    const rawData = await entityManager.query(
      `select user_id from tblloan where delete_flag = 'N' and id = '${loan_id}'`,
    );

    if (rawData.length > 0) {

      const configuration = new Configuration(this.plaidConfig);
      const client = new PlaidApi(configuration);
      const accounts_response = await client.authGet({
        access_token: access_token
      });    

      let ac = accounts_response.data.accounts;
      let ach = accounts_response.data.numbers.ach;
      let insitutionID = accounts_response.data.item.institution_id;

      let bankData = {};
      bankData['accountslength'] = ac.length;

      //to get bank name
      const request: InstitutionsGetByIdRequest = {
        institution_id: insitutionID,
        country_codes: [CountryCode.Us],
      };
      const instituteResponse = await client.institutionsGetById(request);
      bankData['institutionName'] = instituteResponse.data.institution.name;

      //to get bank holder name
      bankData['bankHolderName'] = 'Unknown'
      try {
        const identityReq: IdentityGetRequest = {
          access_token: access_token,
        };
        const identityRes = await client.identityGet(identityReq);

        bankData['bankHolderName'] =
          identityRes.data.accounts.length > 0
            ? identityRes.data.accounts[0].owners[0].names[0]
            : 'Unknown';

      } catch (error) {
        console.log('IdentityGetRequest', error);
      }
      //save plaid access token
      let newPlaid = new PlaidMasterEntity();
      newPlaid.user_id = rawData[0].user_id;
      newPlaid.loan_id = loan_id;
      newPlaid.plaid_access_token = access_token;
      newPlaid.institutionName = bankData['institutionName'];
      newPlaid.bankHolderName = bankData['bankHolderName'];
      let plaidAdded = await this.plaidMasterRepository.save(
        newPlaid,
      );

      bankData['plaidaccesstokenmasterid'] = plaidAdded.id;

      let account_res_list = []
      for (let j = 0; j < ac.length; j++) {          
        let BankAccount = new BankAccounts();
        BankAccount.loan_id = loan_id;
        BankAccount.plaid_access_token_master_id = plaidAdded.id;
        BankAccount.plaidAccountId = ac[j].account_id;
        BankAccount.name = ac[j]['name'].replace('Plaid ', '');
        BankAccount.type = ac[j]['type'];
        BankAccount.subtype = ac[j]['subtype'];
        BankAccount.acno = 'XXXXXXXXXXXX' + ac[j]['mask'];

        //for only checking & saving type accounts
        let is_routing = false;
        for (let i = 0; i < ach.length; i++) {
          if (ac[j]['account_id'] == ach[i]['account_id']) {
            BankAccount.headername =
              ac[j]['name'].replace('Plaid ', '') +
              ' - XXXXXXXXXXXX' +
              ac[j]['mask'];
            BankAccount.routing = ach[i]['routing'];
            BankAccount.wire_routing = ach[i]['wire_routing'];

            is_routing = true;
            break;
          }
        }
        if (!is_routing) {
          BankAccount.headername = ac[j]['name'].replace('Plaid ', '');
          BankAccount.routing = null;
          BankAccount.wire_routing = null;
        }

        BankAccount.institution_id = accounts_response.data.item['institution_id'];
        BankAccount.available = ac[j]['balances']['available'];
        BankAccount.current = ac[j]['balances']['current'];

        let account_res = await this.bankAccountsRepository.save(BankAccount);
        account_res_list.push(account_res)
        /////transactions
      }

      let item_id: any = accounts_response.data.item.item_id
        // await client.itemWebhookUpdate({
        //   access_token: access_token,
        //   webhook: process.env.plaid_webhook_url + `webhook_type=TRANSACTIONS&webhook_code=INITIAL_UPDATE&item_id=${item_id}&error=null&new_transactions=19`
        // });


        // await client.itemWebhookUpdate({
        //   access_token: access_token,
        //   webhook: process.env.plaid_webhook_url + `webhook_type=TRANSACTIONS&webhook_code=HISTORICAL_UPDATE&item_id=${item_id}&error=null&new_transactions=231`
        // });

        var d = new Date();
        var d1 = new Date();
        d1.setDate(d1.getDate() - 365);
        const today = this.dt(d);
        const oneYearAgo = this.dt(d1);

        let z = 0
        function trans(bankTransactionsRepository) {
          if (z < 10) {
            z = z + 1
            try {
              client.transactionsGet({
                access_token: access_token,
                start_date: oneYearAgo,
                end_date: today
              }).then(response => {
                z = 15
                let current_transactions = 0;
                const total_transactions = response.data.total_transactions;

                while (current_transactions < total_transactions) {                
                  
                  const paginatedRequest: TransactionsGetRequest = {
                    access_token: access_token,
                    start_date: oneYearAgo,
                    end_date: today,
                    options: {
                      offset: current_transactions,
                      count: 500 //max:500
                    },
                  };
                  
                  client.transactionsGet(paginatedRequest).then(res => {                      
                    let transactions = res.data.transactions;
                    let transactionArray = [];
                    for (let j = 0; j < ac.length; j++) {                    
                      for (let k = 0; k < transactions.length; k++) {
                        if (ac[j]['account_id'] == transactions[k]['account_id']) {
                          let BankTransaction = new BankTransactions();
                          BankTransaction.bankAccountId = account_res_list[j].id;
                          BankTransaction.amount = transactions[k]['amount'];
                          BankTransaction.category = transactions[k]['category'].join(',');
                          BankTransaction.category_id = transactions[k]['category_id'];
                          BankTransaction.date = transactions[k]['date'];
                          BankTransaction.name = transactions[k]['name'];

                          transactionArray.push(BankTransaction);
                        }
                      }
                    }
                    
                    bankTransactionsRepository.save(transactionArray);

                  })   
                  current_transactions += 500                
                }
              }).catch(error => {
                console.log(error)
                if (error.data.error_code == 'PRODUCT_NOT_READY') {
                  setTimeout(trans, 5000);
                }
              });
            } catch (error) {
              console.log(error);
              if (error.data.error_code == 'PRODUCT_NOT_READY') {
                z = z + 1
                setTimeout(trans, 5000);
              }
            }

          }

        }
        trans(this.bankTransactionsRepository);
        this.createAssets(plaidAdded.id)
      return { statusCode: 200, data: bankData, message:["PLAID Connection Successfull","Request to create Assets sent Successfully"]};
    } else {
        return {
          statusCode: 400,
          message: ['Invalid Loan ID'],
          error: 'Bad Request',
        };
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      message: [new InternalServerErrorException(error)['response']['name']],
      error: 'Bad Request',
    };
  }

  }

  async repullAccounts(id, plaidTokenMasterId){
      const entityManager = getManager();
      try{
        // const rawData:any = await entityManager.query(`SELECT plaid_access_token from tblcustomer where loan_id = '${id}' and plaid_access_token is not null;`);
        const rawData:any = await entityManager.query(`
          SELECT 
            plaid_access_token, 
            "institutionName"
          from tblplaidaccesstokenmaster
          where loan_id = '${id}' 
            and id='${plaidTokenMasterId}'
            and plaid_access_token is not null
            and delete_flag='N'
        `);
        if(rawData.length>0){
            
              const configuration = new Configuration(this.plaidConfig);

              try {
                const client = new PlaidApi(configuration);
                const accounts_response = await client.authGet({access_token:rawData[0]['plaid_access_token']})
                let item_id:any = accounts_response.data.item.item_id
                // await client.itemWebhookUpdate({
                //   access_token:rawData[0]['plaid_access_token'],
                //   webhook:process.env.plaid_webhook_url+`webhook_type=TRANSACTIONS&webhook_code=INITIAL_UPDATE&item_id=${item_id}&error=null&new_transactions=19`
                // });
        
                
                // await client.itemWebhookUpdate({
                //   access_token:rawData[0]['plaid_access_token'],
                //   webhook:process.env.plaid_webhook_url+`webhook_type=TRANSACTIONS&webhook_code=HISTORICAL_UPDATE&item_id=${item_id}&error=null&new_transactions=231`
                // });
                // console.log('accounts_response.data', accounts_response.data);
                
                var d = new Date();
                var d1 = new Date();
                d1.setDate(d1.getDate() - 365);
                const today = this.dt(d);
                const oneYearAgo = this.dt(d1);
                const response  = await client.transactionsGet({
                  access_token:rawData[0]['plaid_access_token'],
                  start_date:oneYearAgo,
                  end_date:today
                });
                // let transactions = response.data.transactions                  
                const total_transactions = response.data.total_transactions;
                let current_transactions = 0;                  

                // console.log('total_transactions', total_transactions);
                

                let ac = accounts_response.data.accounts;
                let ach = accounts_response.data.numbers.ach

                // console.log('ach', ach);
                

                //delete old accounts
                let bankAccountsRes = await this.bankAccountsRepository.find({loan_id: id, plaid_access_token_master_id: plaidTokenMasterId, delete_flag: Flags.N})                    
                if(bankAccountsRes.length>0){
                  for(let i=0; i<bankAccountsRes.length; i++){
                    await this.bankAccountsRepository.update({id: bankAccountsRes[i].id, delete_flag: Flags.N},{delete_flag: Flags.Y})                
                  }
                }
                

                let accountArray = [];                
                for (let j = 0; j < ac.length; j++) {    
                  
                  // let current_transactions = 0;

                  let BankAccount = new BankAccounts();
                  BankAccount.loan_id = id;
                  BankAccount.plaid_access_token_master_id = plaidTokenMasterId;
                  BankAccount.plaidAccountId = ac[j]['account_id'];
                  BankAccount.name = ac[j]['name'].replace("Plaid ","");
                  BankAccount.type = ac[j]['type'];
                  BankAccount.subtype = ac[j]['subtype'];
                  BankAccount.acno = "XXXXXXXXXXXX"+ac[j]['mask'];

                  //for only checking & saving type accounts
                  let is_routing = false;
                  for (let i = 0; i < ach.length; i++) {
                    if(ac[j]['account_id']==ach[i]['account_id']){ 
                      BankAccount.headername = ac[j]['name'].replace("Plaid ","")+" - XXXXXXXXXXXX"+ac[j]['mask'];                              
                      BankAccount.routing = ach[i]['routing'];
                      BankAccount.wire_routing = ach[i]['wire_routing'];

                      is_routing = true;
                      break;
                    }
                  }                        
                  if(!is_routing){
                    BankAccount.headername = ac[j]['name'].replace("Plaid ","");
                    BankAccount.routing = null;
                    BankAccount.wire_routing = null;
                  }

                  BankAccount.institution_id = accounts_response.data.item['institution_id'];
                  BankAccount.available = ac[j]['balances']['available'];
                  BankAccount.current = ac[j]['balances']['current'];                      
                  
                  let account_res = await this.bankAccountsRepository.save(BankAccount)
                  account_res['transactions'] = []       
                  accountArray.push(account_res)
                                          
                }     
                
                /* While loop outside for loop & used await for send response */                    
                while (current_transactions < total_transactions) {
                  // console.log('while loop current_transactions', current_transactions); 

                  const paginatedRequest: TransactionsGetRequest = {
                    access_token: rawData[0]['plaid_access_token'],
                    start_date: oneYearAgo,
                    end_date: today,
                    options: {
                      offset: current_transactions,
                      count: 500 //max:500
                    },
                  };

                  await client.transactionsGet(paginatedRequest).then(async res => {
                    // console.log('each transactions length', res.data.transactions.length);
                    
                    let transactions = res.data.transactions;

                    let transactionArray = [];
                    for (let j = 0; j < ac.length; j++) { 
                      let eachAccountTransactionArray = [];  //to push each acct's transactions in response
                      for (let k = 0; k < transactions.length; k++) {
                        if(ac[j]['account_id']==transactions[k]['account_id']){
                          let BankTransaction = new BankTransactions();
                          BankTransaction.bankAccountId = accountArray[j].id;
                          BankTransaction.amount = transactions[k]['amount'];
                          BankTransaction.category = transactions[k]['category'].join(',');
                          BankTransaction.category_id = transactions[k]['category_id'];
                          BankTransaction.date = transactions[k]['date'];
                          BankTransaction.name = transactions[k]['name'];

                          transactionArray.push(BankTransaction)
                          eachAccountTransactionArray.push(BankTransaction)
                        }                            
                      }
                      accountArray[j].transactions = accountArray[j].transactions.concat(eachAccountTransactionArray);
                    }
                    
                    await this.bankTransactionsRepository.save(transactionArray)
                  })

                  current_transactions += 500
                  // console.log('after added 50 current_transactions', current_transactions);
                }

                return {"statusCode": 200, data:{bankName: rawData[0].institutionName, bankAccounts: accountArray} }; 

              } catch (error) {
                console.log(error)
                return {"statusCode": 400,"message": error.response.data.error_message}
              }
        }else{
          return {"statusCode": 100, message: ['Unable to get plaid access token'] }; 
        }            
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async accounts(id) {
    try { 
      let banks = [];
      let plaidAccessTokens = await this.plaidMasterRepository.find({ loan_id: id, delete_flag: Flags.N });

      if (plaidAccessTokens.length) {
        for (let p = 0; p < plaidAccessTokens.length; p++) {
          let bankAccounts = await this.bankAccountsRepository.find({
            where: {
              loan_id: id,
              plaid_access_token_master_id: plaidAccessTokens[p].id,
              delete_flag: Flags.N
            }
          });

          if (bankAccounts.length > 0) {
            for(let i = 0; i < bankAccounts.length; i++) {
              let bankTransactionsRes = await this.bankTransactionsRepository.find({
                where: {
                  bankAccountId: bankAccounts[i].id
                }
              });

              bankAccounts[i]['transactions'] = bankTransactionsRes;
            }
          }

          banks.push({bankName: plaidAccessTokens[p].institutionName, bankAccounts: bankAccounts})
        }

        return {"statusCode": 200, data: banks };
      } else {          
        return {"statusCode": 100, "message":"No Accounts Available", data: []};
      }
    } catch (error) {
      return {
        "statusCode": 500,
        "message": [new InternalServerErrorException(error)['response']['name']],
        "error": "Bad Request"
      };
    }
  }

  async transactions(id){
      const entityManager = getManager();
      try{
          const rawData:any = await entityManager.query(`SELECT plaid_access_token from tblplaidmaster where loan_id = '${id}' and plaid_access_token is not null;`);
          if(rawData.length>0){

              const configuration = new Configuration(this.plaidConfig);
                try {
                  const client = new PlaidApi(configuration);
                  var d = new Date();
                  var d1 = new Date();
                  d1.setDate(d1.getDate() - 730);
                  const today = this.dt(d);
                  const start = this.dt(d1);

                  const request: TransactionsGetRequest ={
                    access_token:rawData[0]['plaid_access_token'],
                    start_date:start,
                    end_date:today
                  }
                  const response  = await client.transactionsGet(request);
                  let transactions = response.data.transactions;
                  let total_transactions = response.data.total_transactions;
                  let current_transactions = 0;
                  while(transactions.length<total_transactions){
                    const paginatedRequest: TransactionsGetRequest = {
                      access_token: rawData[0]['plaid_access_token'],
                      start_date:start,
                      end_date:today,
                      options: {
                        offset: current_transactions,
                        count: 500 //max:500
                      }

                    };
                    client.transactionsGet(paginatedRequest)
                  }
                  return {"statusCode": 200, data:response.data.transactions }; 
                } catch (error) {
                  console.log(error)
                  return {"statusCode": 400,"message": error.response.data.error_message}
                }
          }else{
              return {"statusCode": 200, data:rawData }; 
          }            
      }catch (error) {
        console.log(error)
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async createAssets(id){
    const entityManager = getManager();
    try{
        const rawData:any = await entityManager.query(`SELECT plaid_access_token from tblplaidmaster where id = '${id}' and plaid_access_token is not null;`);
        if(rawData.length>0){
            
            const configuration = new Configuration(this.plaidConfig);
              try {
                const client = new PlaidApi(configuration);
                const days_requested = 365;
                const options = {};
                const response  = await client.assetReportCreate({access_tokens:[rawData[0]['plaid_access_token']],days_requested,options});
                let data = await this.plaidMasterRepository.update(
                  {id:id},
                  {asset_report_token:response.data.asset_report_token}
                )
                return {"statusCode": 200, data:response.data, message:["Request to Create Assets Sent"] };
              } catch (error) {
                console.log(error)
                return {"statusCode": 400,"message": error.response.data.error_message}
              }
        }else{
            return {"statusCode": 200, data:rawData }; 
        }            
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async getAssets(loanId: string) {
    const entityManager = getManager();

    try{
      const rawData: any = await entityManager.query(
        `
          SELECT
            id,
            asset_report_token
          from
            tblplaidmaster
          where
            loan_id = $1 and asset_report_token is not null
        `,
        [loanId]
      );
      
      for (let i = 0; i < rawData.length; i++) {
        const configuration = new Configuration(this.plaidConfig);

          try {
            const client = new PlaidApi(configuration);
            const request: AssetReportGetRequest = {
              asset_report_token: rawData[i]['asset_report_token'],
              include_insights: true,
            };
            const response  = await client.assetReportGet(request);

            for (const e of response.data.report.items[0].accounts) {
              const mask = 'XXXXXXXXXXXX' + e.mask;
              const accInfo = await entityManager.query(
                `
                  select
                    id
                  from
                    tblbankaccounts
                  where
                    acno = $1 and type = $2 and subtype = $3 and loan_id = $4
                `,
                [mask, e.type, e.subtype, loanId]
              );
              const existingHistoricalBalances = await entityManager.query(
                `
                  SELECT
                    COUNT(*)
                  FROM
                    tblhistoricalbalance
                  WHERE
                    "bankAccountId" = $1
                `,
                [accInfo[0]['id']]
              );
              
              if (accInfo[0] && !Number(existingHistoricalBalances[0].count)) {
                let historicalBalanceArray = [];

                e.historical_balances.map((b)=>{
                  const historicalBalance = new HistoricalBalanceEntity();

                  historicalBalance.bankAccountId = accInfo[0]['id'];
                  historicalBalance.amount = b.current;
                  historicalBalance.date = new Date(b.date);
                  historicalBalance.currency= b.iso_currency_code;

                  historicalBalanceArray.push(historicalBalance);
                });

                this.historicalBalanceRepository.save(historicalBalanceArray);
              } else {
                // need to handle if the account is not exists in the tblbankaccounts
                // We can have 2 columns assets  -->Y or N and transactions --> Y or N and based on that we shall fetch later
              }
            }

            return {"statusCode": 200, message: 'Asset Report Saved Successfully' }; 
          } catch (error) {
            console.log(error);

            if(error.data.error_code == 'PRODUCT_NOT_READY') {
              return {"statusCode":200,message:["Asset report is not ready yet. Try again later"]}
            }

            console.log(error);

            return {"statusCode": 400,"message": error.response.data.error_message}
          }
      }
      
      return { "statusCode": 200, data: rawData };
    } catch (error) {
      console.log(error);
      
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async getAssetsDisplay(id){
    try {
      const banks = [];
      const allAccountAvg = [];
      const plaidAccessTokens = await this.plaidMasterRepository.find({ loan_id: id, delete_flag: Flags.N });

      if (plaidAccessTokens.length) {
        for (let p = 0; p < plaidAccessTokens.length; p++) {
          const bankAccounts = await this.bankAccountsRepository.find({
            where: {
              loan_id: id,
              plaid_access_token_master_id: plaidAccessTokens[p].id,
              delete_flag: Flags.N
            }
          });
          
          if (bankAccounts.length > 0) {
            for (let i = 0; i < bankAccounts.length; i++) {
              const historicalBalances = await this.historicalBalanceRepository.find({
                where: {
                  bankAccountId: bankAccounts[i].id
                }
              });

              bankAccounts[i]['average_balance'] = [];

              const averageCompute = {};
              
              historicalBalances.forEach((historicalBalance) => {
                const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(historicalBalance.date);
                const year = historicalBalance.date.getFullYear();
                const monthYear = month + '-' + year;
                
                if (averageCompute.hasOwnProperty(monthYear)) {
                  averageCompute[monthYear].push(historicalBalance.amount);
                } else{
                  averageCompute[monthYear] = [];
                  averageCompute[monthYear].push(historicalBalance.amount);
                }
              });
              
              for (let key in averageCompute) {
                if (averageCompute.hasOwnProperty(key)) {
                  const average = averageCompute[key].reduce((a, b) => a + b, 0) / averageCompute[key].length;                  
                  const bal = { month: key, value: average.toFixed(2) };

                  bankAccounts[i]['average_balance'].push(bal);
                  allAccountAvg.push(bal);
                }
              }
            }
          }

          banks.push({ bankName: plaidAccessTokens[p].institutionName, bankAccounts: bankAccounts });
        }

        const finalAvg = [];
        const month = [];

        for (let i = 0; i < allAccountAvg.length; i++) {
          if (month.indexOf(allAccountAvg[i].month) === -1) {
            month.push(allAccountAvg[i].month);
          }
        }

        for (let i = 0; i < month.length; i++) {
          let sum = 0;

          for (let j = 0; j < allAccountAvg.length; j++) {
            if (allAccountAvg[j].month === month[i]) {   
              sum += parseInt(allAccountAvg[j].value);
            }
          }

          const avg = { month: month[i], value: sum };
          
          finalAvg.push(avg);
        }

        let minBalance = finalAvg[0].value;

        for (let i = 0; i < finalAvg.length; i++) {
          if (minBalance > finalAvg[i].value) {
            minBalance = finalAvg[i].value;
          }
        }

        return {
          statusCode: 200,
          data: banks,
          allAccountAvg,
          minBalance
        };
      } else {          
        return {
          "statusCode": 100,
          "message": "No Accounts Available",
          data: []
        };
      }
    } catch (error) {
      console.log(error);

      return {
        "statusCode": 500,
        "message": [new InternalServerErrorException(error)['response']['name']],
        "error": "Bad Request"
      };
    }
  }

  async getAuth(id)
  {
    let data = [];
    const entityManager = getManager();
    try{    
      const rawData:any = await entityManager.query(`SELECT id,plaid_access_token from tblplaidmaster where loan_id = '${id}' and plaid_access_token is not null;`);
      
      if(rawData.length>0)
      {
        const configuration = new Configuration(this.plaidConfig);
        const client = new PlaidApi(configuration);
        try{
          for(let i=0;i<rawData.length;i++)
          {
            const response = await client.authGet({
              access_token:rawData[i]['plaid_access_token']
            })
            let achDetails = response.data;
            for(let j=0;j<achDetails.numbers.ach.length;j++)
            {
              let authEntity = new PlaidAuthEntity();
              authEntity.accountNumber = achDetails.numbers.ach[j].account;
              authEntity.routing = achDetails.numbers.ach[j].routing;
              authEntity.wire_routing = achDetails.numbers.ach[j].wire_routing;
              authEntity.plaid_access_token_master_id = rawData[i]['id']
              authEntity.loan_id = id;
              authEntity.plaidAccountId = achDetails.numbers.ach[j].account_id;
              let savedData = await this.pladiAuthRepository.save(authEntity)
              data.push(savedData)
            }
          }
          return {
            statusCode:200,
            data
          }
        }
        catch(error)
        {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
      }
      else
      {
          return {"statusCode":400,"message":"Requested Loan ID Does not exists"}
      }
  }
  catch(error){
    console.log(error)
    return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
  }
  }

  async request_bank_login(id){
      const entityManager = getManager();
      try{
          const rawData:any = await entityManager.query(`SELECT email from tblcustomer where "loanId" = '${id}';`);
          if(rawData.length>0){
              let url:any = process.env.OrkaUrl+'client/plaid/'+id;
              let email:any = rawData[0]['email']
              this.mailService.request_bank_login(email,url)
          }
          return {"statusCode": 200 };
          
      }catch (error) {
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  dt(today){
      var dd:any = today.getDate();
  
      var mm:any = today.getMonth()+1; 
      var yyyy = today.getFullYear();
      if(dd<10) 
      {
        dd='0'+dd;
      } 
  
      if(mm<10) 
      {
        mm='0'+mm;
      } 
      return yyyy+'-'+mm+'-'+dd;
  }
  
  async deleteInformation(id) {
    let bankAccountDetails = await this.bankAccountsRepository.find({
      loan_id: id,
    });
    if (bankAccountDetails) {
      bankAccountDetails.forEach(async bankAccountDetails => {
        let transactionDetails = await this.bankTransactionsRepository.find({
          bankAccountId: bankAccountDetails.id,
        });
        if (transactionDetails) {
          transactionDetails.forEach(async transactionDetails => {
            let deleteTransactionDetails = await this.bankTransactionsRepository.delete(
              {
                bankAccountId: bankAccountDetails.id,
              },
            );
          });
        }
      });
      let delteBankAccountDetails = await this.bankAccountsRepository.delete({
        loan_id: id,
      });
      let deleteOwnerInformation = await this.customerRepository.delete(
        { loanId: id },
      );
    }
    return {
      statusCode: 200,
      data: 'User information deleted successfully',
    };
  }
}
