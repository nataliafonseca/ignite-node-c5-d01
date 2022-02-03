import { inject, injectable } from 'tsyringe';

import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { ICreateStatementDTO } from './ICreateStatementDTO';

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    type,
    amount,
    description,
    sender_id,
    recipient_id,
  }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === 'withdraw' || type === 'transfer') {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    let statementOperation;

    if (type === 'transfer') {
      if (!recipient_id) {
        throw new CreateStatementError.UserNotFound();
      }

      const recipient = await this.usersRepository.findById(recipient_id);

      if (!recipient) {
        throw new CreateStatementError.UserNotFound();
      }

      statementOperation = await this.statementsRepository.create({
        user_id,
        sender_id,
        recipient_id,
        type,
        amount: amount * -1,
        description,
      });

      await this.statementsRepository.create({
        user_id: recipient_id,
        sender_id,
        recipient_id,
        type,
        amount,
        description,
      });
    } else if (type === 'deposit') {
      statementOperation = await this.statementsRepository.create({
        user_id,
        type,
        amount,
        description,
        sender_id,
        recipient_id,
      });
    } else {
      statementOperation = await this.statementsRepository.create({
        user_id,
        type,
        amount: amount * -1,
        description,
        sender_id,
        recipient_id,
      });
    }

    return statementOperation;
  }
}
