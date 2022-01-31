import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getBalanceUsecase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    getBalanceUsecase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("should be able to show user's balance", async () => {
    const user_id = (await createUserUseCase
      .execute({
        email: "user@email.com",
        name: "User Name",
        password: "123456",
      })
      .then((response) => response.id)) as string;

    const response = await getBalanceUsecase.execute({ user_id });

    expect(response).toHaveProperty("balance");
    expect(response).toHaveProperty("statement");
  });

  it("should not be able to show balance of unexistent user", async () => {
    expect(async () => {
      await getBalanceUsecase.execute({ user_id: "d9847r43" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
