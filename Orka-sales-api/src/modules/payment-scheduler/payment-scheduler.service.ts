import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { CreatePaymentSchedulerDto } from './dto/createPaymentSchedulerDto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentSchedule } from 'src/entities/paymentSchedule.entity';
import { UserRepository } from '../../repository/users.repository';
import { Flags } from '../../configs/config.enum';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { MailService } from '../../mail/mail.service';
import { getManager } from 'typeorm';
import { LogRepository } from '../../repository/log.repository';
import { LogEntity } from '../../entities/log.entity';
import crypto from 'crypto';

config();

@Injectable()
export class PaymentSchedulerService {
  constructor(
    @InjectRepository(PaymentScheduleRepository)
    private readonly paymentScheduleRepository: PaymentScheduleRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    private readonly mailService: MailService,
  ) {}

  async create(createPaymentSchedulerDto: CreatePaymentSchedulerDto) {
    try {
      const entityManager = getManager();
      const lograwData = await entityManager.query(
        `select user_id from tblloan where id = '${createPaymentSchedulerDto.paymentScheduler[0].loanId}'`,
      );

      const paymentScheduleCheck = await this.paymentScheduleRepository.find({
        where: { loanId: createPaymentSchedulerDto.paymentScheduler[0].loanId },
      });
      if (paymentScheduleCheck.length === 0) {
        const paymentScheduleArray = createPaymentSchedulerDto.paymentScheduler.map(
          i => {
            const paymentSchedule = new PaymentSchedule();
            paymentSchedule.loanId = i.loanId;
            paymentSchedule.unpaidPrincipal = i.unpaidPrincipal;
            paymentSchedule.principal = i.principal;
            paymentSchedule.interest = i.interest;
            paymentSchedule.fees = i.fees;
            paymentSchedule.amount = i.amount;
            paymentSchedule.scheduleDate = i.scheduleDate;
            return paymentSchedule;
          },
        );

        await this.paymentScheduleRepository.save(paymentScheduleArray);
        const log = new LogEntity();
        log.loan_id = createPaymentSchedulerDto.paymentScheduler[0].loanId;
        log.user_id = lograwData[0].user_id;
        log.module = 'Sales: Payment Scheduler';
        await this.logRepository.save(log);
      }
      let url: any = process.env.OrkaUrl;
      const length = 8;
      let password = crypto
        .randomBytes(length)
        .toString('hex')
        .substr(length)
        .toUpperCase();
      const salt = await bcrypt.genSalt();
      const hashPassword: any = await bcrypt.hash(password, salt);

      const user: any = await entityManager.query(
        `select t2.id,t2.email, t2.salt, t2."emailVerify" as emailVerify from tblloan t join tbluser t2 on t.user_id = t2.id where t.id ='${createPaymentSchedulerDto.paymentScheduler[0].loanId}'`,
      );
      if (user.length > 0) {
        if (user[0].emailverify === Flags.N) {
          url += `borrower/verify/${user[0].id}/${salt}`;
          await this.userRepository.update(
            { id: user[0].id },
            {
              salt,
              password: hashPassword,
              active_flag: Flags.Y,
            },
          );
        } else {
          password = 'Password already sent your mail';
          url += `borrower/verify/${user[0].i}/${user[0].salt}`;
        }
        this.mailService.inviteEmail(user[0].email, password, url);
        const log = new LogEntity();
        log.loan_id = createPaymentSchedulerDto.paymentScheduler[0].loanId;
        log.user_id = lograwData[0].user_id;
        log.module = 'Sales: Email Verification mail send';
        await this.logRepository.save(log);
        return { statusCode: 200 };
      }
    } catch (error) {
      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: [resp],
        error: 'Bad Request',
      };
    }
  }
}
