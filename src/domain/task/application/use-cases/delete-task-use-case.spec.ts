import { InMemoryTasksRepository } from '@test/repositories/in-memory-tasks-repository'
import { DeleteTaskUseCase } from './delete-task-use-case'
import { TaskNotFoundError } from './errors/task-not-found-error'
import { makeTask } from '@test/factories/make-task'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryTasksRepository: InMemoryTasksRepository
let sut: DeleteTaskUseCase

describe('Delete Task Use Case', () => {
  beforeEach(() => {
    inMemoryTasksRepository = new InMemoryTasksRepository()
    sut = new DeleteTaskUseCase(inMemoryTasksRepository)
  })

  const currentUser = { sub: new UniqueEntityID().toString() } as UserPayload

  it('should be able to delete a task', async () => {
    const task = makeTask({ userId: new UniqueEntityID(currentUser.sub) })
    inMemoryTasksRepository.save(task)

    const result = await sut.execute({
      id: task.id.toString(),
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryTasksRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a task that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(TaskNotFoundError)
  })
})
