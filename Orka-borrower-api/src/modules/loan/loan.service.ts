import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Loan } from "../../entities/loan.entity";

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan) private readonly loanRepository: Repository<Loan>
  ) {}

  public async update(id: string, data: Pick<Loan, "selectedBankAccountId">): Promise<Loan> {
    const loan = await this.loanRepository.findOne({ id });

    if (!loan) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Loan not found'
      });
    }

    loan.selectedBankAccountId = data.selectedBankAccountId;

    await this.loanRepository.save(loan);

    return loan;
  }
}
