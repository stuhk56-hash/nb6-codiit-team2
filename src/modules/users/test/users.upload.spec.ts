import { Test, TestingModule } from '@nestjs/testing';
import { UsersUploadService } from './users.upload.service';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersUploadService', () => {
  let service: UsersUploadService;
  let usersService: UsersService;

  // S3나 파일 시스템을 직접 건드리지 않도록 Mocking
  const mockUsersService = {
    updateProfileImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersUploadService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<UsersUploadService>(UsersUploadService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('uploadProfileImage', () => {
    // 가짜 파일 객체 생성 (Multer.File 형식)
    const mockFile = {
      fieldname: 'file',
      originalname: 'profile.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('test-image-data'),
      size: 1024,
    } as Express.Multer.File;

    it('이미지 파일을 업로드하고 유저 프로필 URL을 업데이트해야 한다', async () => {
      const userId = 1;
      const fakeUrl = 'https://s3.amazonaws.com/bucket/profile.png';

      // 내부 업로드 로직을 mock (실제 S3 전송 생략)
      jest.spyOn(service, 'saveFileToStorage').mockResolvedValue(fakeUrl);
      mockUsersService.updateProfileImage.mockResolvedValue({ success: true });

      const result = await service.uploadProfileImage(userId, mockFile);

      expect(result.url).toBe(fakeUrl);
      expect(usersService.updateProfileImage).toHaveBeenCalledWith(
        userId,
        fakeUrl,
      );
    });

    it('허용되지 않는 파일 형식(exe, pdf 등)은 BadRequestException을 던져야 한다', async () => {
      const badFile = { ...mockFile, mimetype: 'application/pdf' };

      await expect(service.uploadProfileImage(1, badFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('파일 크기가 제한(예: 5MB)을 초과하면 에러를 던져야 한다', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 }; // 10MB

      await expect(service.uploadProfileImage(1, largeFile)).rejects.toThrow(
        'File too large',
      );
    });
  });
});
