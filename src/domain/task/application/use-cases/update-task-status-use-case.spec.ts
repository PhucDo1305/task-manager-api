import { InMemoryTasksRepository } from '@test/repositories/in-memory-tasks-repository'
import { UpdateTaskStatusUseCase } from './update-task-status-use-case'
import { TaskNotFoundError } from './errors/task-not-found-error'
import { makeTask } from '@test/factories/make-task'
import { TaskStatus } from '../../enterprise/entities/task'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryTasksRepository: InMemoryTasksRepository
let sut: UpdateTaskStatusUseCase

describe('Update Task Status Use Case', () => {
  beforeEach(() => {
    inMemoryTasksRepository = new InMemoryTasksRepository()
    sut = new UpdateTaskStatusUseCase(inMemoryTasksRepository)
  })

  const currentUser = { sub: 'user-id' } as UserPayload

  it('should be able to update the status of a task', async () => {
    const task = makeTask({ userId: new UniqueEntityID(currentUser.sub) })
    inMemoryTasksRepository.save(task)

    const result = await sut.execute({
      id: task.id.toString(),
      status: TaskStatus.DONE,
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryTasksRepository.items).toHaveLength(1)
    expect(inMemoryTasksRepository.items[0].status).toBe(TaskStatus.DONE)
  })

  it('should not be able to update the status of a task that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      status: TaskStatus.DONE,
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(TaskNotFoundError)
  })
})
