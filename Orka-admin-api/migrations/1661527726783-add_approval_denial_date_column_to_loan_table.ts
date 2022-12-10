import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addApprovalDenialDateColumnToLoanTable1661527726783 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tblloan',
      new TableColumn({
        name: 'approval_denial_date',
        isNullable: true,
        type: 'timestamp',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tblloan', 'approval_denial_date');
  }
}
