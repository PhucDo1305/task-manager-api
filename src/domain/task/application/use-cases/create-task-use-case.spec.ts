import { faker } from '@faker-js/faker'
import { InMemoryTasksRepository } from '@test/repositories/in-memory-tasks-repository'
import { CreateTaskUseCase } from './create-task-use-case'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

let inMemoryTasksRepository: InMemoryTasksRepository
let sut: CreateTaskUseCase

describe('Create Task Use Case', () => {
  beforeEach(() => {
    inMemoryTasksRepository = new InMemoryTasksRepository()
    sut = new CreateTaskUseCase(inMemoryTasksRepository)
  })

  const taskData = {
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    dueDate: faker.date.future(),
    currentUser: { sub: faker.string.uuid() } as UserPayload,
  }

  it('should be able to create a new task', async () => {
    const result = await sut.execute(taskData)

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryTasksRepository.items).toHaveLength(1)
    expect(inMemoryTasksRepository.items[0]).toMatchObject({
      title: taskData.title,
      description: taskData.description,
    })
  })
})
