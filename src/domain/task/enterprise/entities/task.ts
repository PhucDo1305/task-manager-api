import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface TaskProps {
  title: string
  userId: UniqueEntityID
  description: string
  status: TaskStatus
  dueDate: Date
  createdAt: Date
  updatedAt: Date | null
}

export class Task extends Entity<TaskProps> {
  get title() {
    return this.props.title
  }

  set title(title: string) {
    this.props.title = title
  }

  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description
  }

  get status() {
    return this.props.status
  }

  set status(status: TaskStatus) {
    this.props.status = status
  }

  get dueDate() {
    return this.props.dueDate
  }

  set dueDate(dueDate: Date) {
    this.props.dueDate = dueDate
  }

  get createdAt() {
    return this.props.createdAt
  }

  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set updatedAt(updatedAt: Date | null) {
    this.props.updatedAt = updatedAt
  }

  get userId() {
    return this.props.userId
  }

  set userId(userId: UniqueEntityID) {
    this.props.userId = userId
  }

  static create(
    props: Optional<
      TaskProps,
      'dueDate' | 'status' | 'createdAt' | 'updatedAt'
    >,
    id?: UniqueEntityID,
  ) {
    const task = new Task(
      {
        ...props,
        dueDate: props.dueDate ?? null,
        updatedAt: props.updatedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? TaskStatus.PENDING,
      },
      id,
    )

    return task
  }
}
