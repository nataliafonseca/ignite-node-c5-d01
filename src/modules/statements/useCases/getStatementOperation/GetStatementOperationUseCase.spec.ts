import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to get statement operation", async () => {
    const user_id = (await createUserUseCase
      .execute({
        email: "user@email.com",
        name: "User Name",
        password: "123456",
      })
      .then((response) => response.id)) as string;

    const statement_id = (await createStatementUseCase
      .execute({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit",
      })
      .then((response) => response.id)) as string;

    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statement.type).toEqual("deposit");
    expect(statement.amount).toBe(100);
  });

  it("should not be able to get statement operation for an unexistent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "dhuifhuihfd",
        statement_id: "fjfiejre23",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement operation for an unexistent statement", async () => {
    expect(async () => {
      const user_id = (await createUserUseCase
        .execute({
          email: "user@email.com",
          name: "User Name",
          password: "123456",
        })
        .then((response) => response.id)) as string;

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: "fjfiejre23",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
