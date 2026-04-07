import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.findById(user.id);
    }

    @Patch('me')
    updateProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(user.id, dto);
    }

    @Delete('me')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAccount(@CurrentUser() user: AuthenticatedUser) {
        await this.usersService.softDelete(user.id);
    }
}
