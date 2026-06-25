import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('wraps repository failures as internal server errors', async () => {
    const repo = {
      find: jest.fn().mockRejectedValue(new Error('db down')),
    } as any;
    const userProjectsRepo = { find: jest.fn() } as any;
    const serviceWithRepo = new ProjectsService(repo, userProjectsRepo);

    await expect(serviceWithRepo.findAll()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('uses repository find for projectName filters containing quotes', async () => {
    const repo = {
      find: jest.fn().mockResolvedValue([{}]),
    } as any;
    const userProjectsRepo = { find: jest.fn() } as any;
    const serviceWithRepo = new ProjectsService(repo, userProjectsRepo);

    await serviceWithRepo.findAll({ projectName: "abc' OR 1=1--" });

    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { projectName: "abc' OR 1=1--" },
      }),
    );
  });
});
