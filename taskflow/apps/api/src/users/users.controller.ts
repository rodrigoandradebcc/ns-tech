import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthUser { id: string; }

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }
}
