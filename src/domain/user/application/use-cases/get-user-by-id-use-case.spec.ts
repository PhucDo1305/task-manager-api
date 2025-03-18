import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UserNotFoundError } from './errors/user-not-found-error'
import { GetUserByIdUseCase } from './get-user-by-id-use-case'

let inMemoryUsersRepository: InMemoryUsersRepository
let sut: GetUserByIdUseCase

describe('Get User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new GetUserByIdUseCase(inMemoryUsersRepository)
  })

  it('should be able to get a user', async () => {
    const user = makeUser()
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      id: user.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items).toHaveLength(1)
    expect(result.value).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          name: user.name,
          email: user.email,
          password: user.password,
        }),
      }),
    )
  })

  it('should not be able to get a user that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })
})
