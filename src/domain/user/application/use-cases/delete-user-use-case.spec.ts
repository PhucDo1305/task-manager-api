import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UserNotFoundError } from './errors/user-not-found-error'
import { DeleteUserUseCase } from './delete-user-use-case'

let inMemoryUsersRepository: InMemoryUsersRepository
let sut: DeleteUserUseCase

describe('Delete User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new DeleteUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to delete a user', async () => {
    const user = makeUser()
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      id: user.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a user that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })
})
