import { InMemoryTasksRepository } from '@test/repositories/in-memory-tasks-repository'
import { FetchTasksUseCase } from './fetch-tasks-use-case'
import { makeTask } from '@test/factories/make-task'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TaskStatus } from '../../enterprise/entities/task'

let inMemoryTasksRepository: InMemoryTasksRepository
let sut: FetchTasksUseCase

describe('Fetch Tasks Use Case', () => {
  beforeEach(() => {
    inMemoryTasksRepository = new InMemoryTasksRepository()
    sut = new FetchTasksUseCase(inMemoryTasksRepository)
  })

  const currentUser = { sub: new UniqueEntityID().toString() } as UserPayload

  it('should be able to fetch tasks', async () => {
    const taskOne = makeTask({ userId: new UniqueEntityID(currentUser.sub) })
    const taskTwo = makeTask({ userId: new UniqueEntityID(currentUser.sub) })
    inMemoryTasksRepository.save(taskOne)
    inMemoryTasksRepository.save(taskTwo)

    const result = await sut.execute({
      currentUser,
      limit: 10,
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        tasks: expect.arrayContaining([
          expect.objectContaining({
            title: taskOne.title,
            description: taskOne.description,
          }),
          expect.objectContaining({
            title: taskTwo.title,
            description: taskTwo.description,
          }),
        ]),
      }),
    )
  })

  it('should be able to fetch tasks with pagination', async () => {
    for (let index = 0; index < 25; index++) {
      const task = makeTask({ userId: new UniqueEntityID(currentUser.sub) })
      inMemoryTasksRepository.save(task)
    }

    const result = await sut.execute({
      currentUser,
      limit: 10,
      page: 2,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value.tasks).toHaveLength(10)
    expect(result.value.metadata).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      nextPage: 3,
      previousPage: 1,
    })
  })

  it('should be able to filter tasks by status', async () => {
    for (let index = 0; index < 10; index++) {
      const status = index % 2 === 0 ? TaskStatus.PENDING : TaskStatus.DONE
      const task = makeTask({
        userId: new UniqueEntityID(currentUser.sub),
        status,
      })
      inMemoryTasksRepository.save(task)
    }

    const result = await sut.execute({
      currentUser,
      limit: 10,
      page: 1,
      status: TaskStatus.DONE,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value.tasks).toHaveLength(5)
    expect(
      result.value.tasks.every((task) => task.status === TaskStatus.DONE),
    ).toBe(true)
  })

  it('should be able to search tasks by title or description', async () => {
    for (let index = 0; index < 10; index++) {
      const task = makeTask({
        userId: new UniqueEntityID(currentUser.sub),
        title: `Task ${index}`,
        description: `Description ${index}`,
      })
      inMemoryTasksRepository.save(task)
    }

    const result = await sut.execute({
      currentUser,
      limit: 10,
      page: 1,
      search: 'Task 1',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value.tasks).toHaveLength(1)
    expect(result.value.tasks[0].title).toContain('Task 1')
  })
})
