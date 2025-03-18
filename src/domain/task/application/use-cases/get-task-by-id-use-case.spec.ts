import { InMemoryTasksRepository } from '@test/repositories/in-memory-tasks-repository'
import { GetTaskByIdUseCase } from './get-task-by-id-use-case'
import { TaskNotFoundError } from './errors/task-not-found-error'
import { makeTask } from '@test/factories/make-task'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryTasksRepository: InMemoryTasksRepository
let sut: GetTaskByIdUseCase

describe('Get Task By Id Use Case', () => {
  beforeEach(() => {
    inMemoryTasksRepository = new InMemoryTasksRepository()
    sut = new GetTaskByIdUseCase(inMemoryTasksRepository)
  })

  const currentUser = { sub: new UniqueEntityID().toString() } as UserPayload

  it('should be able to get a task by id', async () => {
    const task = makeTask({ userId: new UniqueEntityID(currentUser.sub) })
    inMemoryTasksRepository.save(task)

    const result = await sut.execute({
      id: task.id.toString(),
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        task: expect.objectContaining({
          title: task.title,
          description: task.description,
        }),
      }),
    )
  })

  it('should not be able to get a task that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(TaskNotFoundError)
  })
})
