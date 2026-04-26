import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type SafeTask = Omit<Task, 'tags'> & { tags: string[] };

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<SafeTask[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId, status: { not: 'ARCHIVED' } },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
    });
    return tasks.map(this.serializeTask);
  }

  async create(userId: string, dto: CreateTaskDto): Promise<SafeTask> {
    this.validateDueDate(dto.dueDate);

    const order = dto.order ?? (await this.nextOrder(userId, dto.status));

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        tags: JSON.stringify(dto.tags),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        order,
        userId,
      },
    });
    return this.serializeTask(task);
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<SafeTask> {
    await this.findOwned(id, userId);

    this.validateDueDate(dto.dueDate);

    const current = await this.prisma.task.findFirst({ where: { id, userId } });
    const statusChanged = dto.status && dto.status !== current!.status;
    const order =
      dto.order !== undefined
        ? dto.order
        : statusChanged
          ? await this.nextOrder(userId, dto.status!)
          : undefined;

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.tags !== undefined && { tags: JSON.stringify(dto.tags) }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
        ...(order !== undefined && { order }),
      },
    });
    return this.serializeTask(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwned(id, userId);
    await this.prisma.task.delete({ where: { id } });
  }

  async archive(id: string, userId: string): Promise<SafeTask> {
    await this.findOwned(id, userId);
    const task = await this.prisma.task.update({
      where: { id },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });
    return this.serializeTask(task);
  }

  private async findOwned(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  private async nextOrder(userId: string, status: string): Promise<number> {
    const last = await this.prisma.task.aggregate({
      where: { userId, status },
      _max: { order: true },
    });
    return (last._max.order ?? 0) + 1024;
  }

  private validateDueDate(dueDate?: string) {
    if (dueDate && new Date(dueDate) < new Date()) {
      throw new BadRequestException('dueDate não pode ser no passado');
    }
  }

  private serializeTask(task: Task): SafeTask {
    const { tags, ...rest } = task;
    return { ...rest, tags: JSON.parse(tags) as string[] };
  }
}
