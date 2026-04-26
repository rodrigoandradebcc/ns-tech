import { IsInt } from 'class-validator';

export class ReorderTaskDto {
  @IsInt()
  order: number;
}
