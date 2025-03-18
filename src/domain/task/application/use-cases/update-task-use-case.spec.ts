import { faker } from '@faker-js/faker'
import { InMemoryTasksRepository } from '@test/repositories/in-memory-tasks-repository'
import { UpdateTaskUseCase } from './update-task-use-case'
import { TaskNotFoundError } from './errors/task-not-found-error'
import { makeTask } from '@test/factories/make-task'
import { TaskStatus } from '../../enterprise/entities/task'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let inMemoryTasksRepository: InMemoryTasksRepository
let sut: UpdateTaskUseCase

describe('Update Task Use Case', () => {
  beforeEach(() => {
    inMemoryTasksRepository = new InMemoryTasksRepository()
    sut = new UpdateTaskUseCase(inMemoryTasksRepository)
  })

  const updatedTaskData = {
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: TaskStatus.DONE,
    dueDate: faker.date.future(),
  }

  const currentUser = { sub: new UniqueEntityID().toString() } as UserPayload

  it('should be able to update a task', async () => {
    const task = makeTask({ userId: new UniqueEntityID(currentUser.sub) })
    inMemoryTasksRepository.save(task)

    const result = await sut.execute({
      id: task.id.toString(),
      ...updatedTaskData,
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryTasksRepository.items).toHaveLength(1)
    expect(inMemoryTasksRepository.items[0]).toMatchObject({
      id: task.id,
      title: task.title,
      description: task.description,
    })
  })

  it('should not be able to update a task that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      ...updatedTaskData,
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(TaskNotFoundError)
  })
})
