import { Statement } from '../../entities/Statement';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export type ICreateStatementDTO = {
  user_id: string;
  description: string;
  amount: number;
  type: OperationType;
  sender_id?: string;
  recipient_id?: string;
};
