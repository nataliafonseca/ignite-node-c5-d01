import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create statements", async () => {
    const user_id = (await createUserUseCase
      .execute({
        email: "user@email.com",
        name: "User Name",
        password: "123456",
      })
      .then((response) => response.id)) as string;

    const deposit = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit",
    });
    const withdraw = await createStatementUseCase.execute({
      user_id,
      type: OperationType.WITHDRAW,
      amount: 80,
      description: "deposit",
    });

    expect(deposit.type).toEqual("deposit");
    expect(deposit.amount).toBe(100);
    expect(withdraw.type).toEqual("withdraw");
    expect(withdraw.amount).toBe(80);
  });

  it("should not be able to create statements for an unexistent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "dhuifhuihfd",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "dhuifhuihfd",
        type: OperationType.WITHDRAW,
        amount: 80,
        description: "deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to make an withdraw if there are insufficient funds", async () => {
    expect(async () => {
      const user_id = (await createUserUseCase
        .execute({
          email: "user@email.com",
          name: "User Name",
          password: "123456",
        })
        .then((response) => response.id)) as string;

      await createStatementUseCase.execute({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 50,
        description: "deposit",
      });
      await createStatementUseCase.execute({
        user_id,
        type: OperationType.WITHDRAW,
        amount: 80,
        description: "deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
