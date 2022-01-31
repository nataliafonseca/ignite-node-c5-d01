import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able to show user profile", async () => {
    const id = (await createUserUseCase
      .execute({
        email: "user@email.com",
        name: "User Name",
        password: "123456",
      })
      .then((response) => response.id)) as string;

    const user = await showUserProfileUseCase.execute(id);

    expect(user).toHaveProperty("id");
    expect(user.name).toEqual("User Name");
  });

  it("should not be able to show profile of unexistent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("jdhfjknasdns");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
