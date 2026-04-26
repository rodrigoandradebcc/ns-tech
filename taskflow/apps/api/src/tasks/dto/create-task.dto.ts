import {
  IsArray,
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const STATUSES = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE', 'ARCHIVED'] as const;
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(STATUSES)
  status: Status;

  @IsIn(PRIORITIES)
  priority: Priority;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
