import { faker } from '@faker-js/faker'
import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UpdateUserUseCase } from './update-user-use-case'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { UserNotFoundError } from './errors/user-not-found-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher

let sut: UpdateUserUseCase

describe('Update User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()
    sut = new UpdateUserUseCase(inMemoryUsersRepository, fakeHasher)
  })

  const userData = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }

  it('should be able to update a user', async () => {
    const user = makeUser(userData)
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      id: user.id.toString(),
      ...userData,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items).toHaveLength(1)
    expect(inMemoryUsersRepository.items[0]).toMatchObject({
      id: user.id,
      email: userData.email,
    })
  })

  it('should not be able to update a user that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      ...userData,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('should not be able to update a new user with an email that already exists', async () => {
    const userOne = makeUser(userData)
    inMemoryUsersRepository.save(userOne)

    const userTwo = makeUser({
      ...userData,
      email: 'johndoe@email.com',
    })
    inMemoryUsersRepository.save(userTwo)

    const result = await sut.execute({
      ...userData,
      id: userOne.id.toString(),
      email: userTwo.email,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
