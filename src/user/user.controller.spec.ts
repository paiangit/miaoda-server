import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('AppController', () => {
  let appController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    appController = app.get<UserController>(UserController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.findOne('1')).toBe('{"data":{"created_at":"2022-01-17T17:36:37.658Z","updated_at":"2022-01-18T08:59:16.477Z","id":1,"work_id":null,"username":"paian666","phone":"","email":null,"gender":1,"avatar":null,"status":-1},"code":0,"msg":"请求成功"}');
    });
  });
});
