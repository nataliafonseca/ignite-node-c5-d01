import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;

    const route = request.originalUrl.replace(`${request.baseUrl}/`, '');
    const splittedPath = route.split('/');
    const type = splittedPath[0] as OperationType;

    const statementInfo = {
      user_id,
      type,
      amount,
      description,
    };

    if (type === 'transfer') {
      const { user_id: recipient_id } = request.params;
      Object.assign(statementInfo, { recipient_id });
      Object.assign(statementInfo, { sender_id: user_id });
    }

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute(statementInfo);

    return response.status(201).json(statement);
  }
}
