import {
  Controller,
  Post,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse } from './dto/user-response.dto';
import { UserConflictDto } from './dto/user-conflict.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UserNotFoundDto } from './dto/user-not-found.dto';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원 가입 성공',
    type: UserResponse,
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 유저',
    type: UserConflictDto,
  })
  async signUp(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(createUserDto);
  }

  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '내 정보 수정 성공 및 수정된 유저 정보 반환',
    type: UserResponse,
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 유저 입니다.',
    type: UserNotFoundDto,
  })
  @ApiConsumes('multipart/form-data')
  // @UseGuards(JwtAuthGuard) // Add this back when auth is ready
  @UseInterceptors(FileInterceptor('image'))
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    // @GetUser() user: User, // Add this back when auth is ready
  ): Promise<UserResponse> {
    const mockUserId = 'cuid-mock-user-id'; // Replace with real user ID from token
    return this.usersService.update(mockUserId, updateUserDto, file);
  }
}
