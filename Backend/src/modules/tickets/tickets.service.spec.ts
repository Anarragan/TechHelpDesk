import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, PriorityLevel } from './entities/ticket.entity';
import { Client } from '../clients/entities/client.entity';
import { Technician } from '../technicians/entities/technician.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BusinessException } from '../../common/filters/business-exception.filter';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketsRepository: Repository<Ticket>;
  let clientsRepository: Repository<Client>;
  let techniciansRepository: Repository<Technician>;
  let categoriesRepository: Repository<Category>;
  let usersRepository: Repository<User>;

  const mockTicketsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  };

  const mockClientsRepository = {
    findOne: jest.fn(),
  };

  const mockTechniciansRepository = {
    findOne: jest.fn(),
  };

  const mockCategoriesRepository = {
    findOne: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketsRepository,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientsRepository,
        },
        {
          provide: getRepositoryToken(Technician),
          useValue: mockTechniciansRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketsRepository = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    clientsRepository = module.get<Repository<Client>>(getRepositoryToken(Client));
    techniciansRepository = module.get<Repository<Technician>>(getRepositoryToken(Technician));
    categoriesRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTicketDto = {
      title: 'Computer not working',
      description: 'My computer is not turning on properly',
      clientId: 1,
      categoryId: 1,
      createdById: 1,
      priority: PriorityLevel.HIGH,
    };

    const mockClient = { id: 1, name: 'John Doe' } as Client;
    const mockCategory = { id: 1, name: 'Hardware' } as Category;
    const mockUser = { 
      id: 1, 
      username: 'admin',
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'hashed',
      role: { id: 1, name: 'ADMIN', users: [] },
      createdTickets: []
    } as User;
    const mockTechnician = { id: 1, name: 'Tech User' } as Technician;

    it('should create a ticket successfully without technician', async () => {
      mockClientsRepository.findOne.mockResolvedValue(mockClient);
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const expectedTicket = {
        id: 1,
        ...createTicketDto,
        client: mockClient,
        category: mockCategory,
        createdBy: mockUser,
        status: TicketStatus.OPEN,
      };

      mockTicketsRepository.create.mockReturnValue(expectedTicket);
      mockTicketsRepository.save.mockResolvedValue(expectedTicket);

      const result = await service.create(createTicketDto, { sub: 1, role: 'ADMIN' });

      expect(mockClientsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCategoriesRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTicketsRepository.create).toHaveBeenCalled();
      expect(mockTicketsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expectedTicket);
    });

    it('should create a ticket successfully with technician', async () => {
      const createTicketDtoWithTech = { ...createTicketDto, technicianId: 1 };

      mockClientsRepository.findOne.mockResolvedValue(mockClient);
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockTechniciansRepository.findOne.mockResolvedValue(mockTechnician);
      mockTicketsRepository.count.mockResolvedValue(2); // Technician has 2 in-progress tickets

      const expectedTicket = {
        id: 1,
        ...createTicketDtoWithTech,
        client: mockClient,
        category: mockCategory,
        createdBy: mockUser,
        technician: mockTechnician,
        status: TicketStatus.OPEN,
      };

      mockTicketsRepository.create.mockReturnValue(expectedTicket);
      mockTicketsRepository.save.mockResolvedValue(expectedTicket);

      const result = await service.create(createTicketDtoWithTech, { sub: 1, role: 'ADMIN' });

      expect(mockTechniciansRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTicketsRepository.count).toHaveBeenCalledWith({
        where: {
          technician: { id: 1 },
          status: TicketStatus.IN_PROGRESS,
        },
      });
      expect(result).toEqual(expectedTicket);
    });

    it('should throw BadRequestException when client is not provided', async () => {
      const invalidDto = { ...createTicketDto, clientId: undefined };

      await expect(service.create(invalidDto as any, { sub: 1, role: 'ADMIN' }))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException when client does not exist', async () => {
      mockClientsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createTicketDto, { sub: 1, role: 'ADMIN' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockClientsRepository.findOne.mockResolvedValue(mockClient);
      mockCategoriesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createTicketDto, { sub: 1, role: 'ADMIN' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockClientsRepository.findOne.mockResolvedValue(mockClient);
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createTicketDto, { sub: 1, role: 'ADMIN' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw BusinessException when technician workload exceeds limit', async () => {
      const createTicketDtoWithTech = { ...createTicketDto, technicianId: 1 };

      mockClientsRepository.findOne.mockResolvedValue(mockClient);
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockTechniciansRepository.findOne.mockResolvedValue(mockTechnician);
      mockTicketsRepository.count.mockResolvedValue(5); // Technician already has 5 tickets

      await expect(service.create(createTicketDtoWithTech, { sub: 1, role: 'ADMIN' }))
        .rejects
        .toThrow(BusinessException);
    });
  });

  describe('update - Change Status', () => {
    const mockTicket = {
      id: 1,
      title: 'Test Ticket',
      description: 'Test Description',
      status: TicketStatus.OPEN,
      priority: PriorityLevel.MEDIUM,
      client: { id: 1, name: 'Client' } as Client,
      category: { id: 1, name: 'Category' } as Category,
      createdBy: { 
        id: 1, 
        username: 'admin',
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashed',
        role: { id: 1, name: 'ADMIN', users: [] },
        createdTickets: []
      } as User,
      technician: { id: 1, user: { id: 2 } } as Technician,
    } as Ticket;

    const mockUser = { sub: 1, role: 'ADMIN' };

    beforeEach(() => {
      mockTicketsRepository.findOne.mockResolvedValue(mockTicket);
    });

    it('should update ticket status from OPEN to IN_PROGRESS', async () => {
      const updateDto = { status: TicketStatus.IN_PROGRESS };
      const updatedTicket = { ...mockTicket, status: TicketStatus.IN_PROGRESS };

      mockTicketsRepository.save.mockResolvedValue(updatedTicket);
      mockTicketsRepository.findOne
        .mockResolvedValueOnce(mockTicket)
        .mockResolvedValueOnce(updatedTicket);

      const result = await service.update(1, updateDto, mockUser);

      expect(mockTicketsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TicketStatus.IN_PROGRESS })
      );
      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should update ticket status from IN_PROGRESS to RESOLVED', async () => {
      const inProgressTicket = { ...mockTicket, status: TicketStatus.IN_PROGRESS };
      const updateDto = { status: TicketStatus.RESOLVED };
      const resolvedTicket = { ...mockTicket, status: TicketStatus.RESOLVED };

      mockTicketsRepository.findOne
        .mockResolvedValueOnce(inProgressTicket)
        .mockResolvedValueOnce(resolvedTicket);
      mockTicketsRepository.save.mockResolvedValue(resolvedTicket);

      const result = await service.update(1, updateDto, mockUser);

      expect(mockTicketsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TicketStatus.RESOLVED })
      );
      expect(result.status).toBe(TicketStatus.RESOLVED);
    });

    it('should update ticket status from RESOLVED to CLOSED', async () => {
      const resolvedTicket = { ...mockTicket, status: TicketStatus.RESOLVED };
      const updateDto = { status: TicketStatus.CLOSED };
      const closedTicket = { ...mockTicket, status: TicketStatus.CLOSED };

      mockTicketsRepository.findOne
        .mockResolvedValueOnce(resolvedTicket)
        .mockResolvedValueOnce(closedTicket);
      mockTicketsRepository.save.mockResolvedValue(closedTicket);

      const result = await service.update(1, updateDto, mockUser);

      expect(mockTicketsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TicketStatus.CLOSED })
      );
      expect(result.status).toBe(TicketStatus.CLOSED);
    });

    it('should throw BusinessException for invalid status transition (OPEN to RESOLVED)', async () => {
      const updateDto = { status: TicketStatus.RESOLVED };

      await expect(service.update(1, updateDto, mockUser))
        .rejects
        .toThrow(BusinessException);
    });

    it('should throw BusinessException for invalid status transition (OPEN to CLOSED)', async () => {
      const updateDto = { status: TicketStatus.CLOSED };

      await expect(service.update(1, updateDto, mockUser))
        .rejects
        .toThrow(BusinessException);
    });

    it('should throw BusinessException when trying to change status of CLOSED ticket', async () => {
      const closedTicket = { ...mockTicket, status: TicketStatus.CLOSED };
      const updateDto = { status: TicketStatus.OPEN };

      mockTicketsRepository.findOne.mockResolvedValueOnce(closedTicket);

      await expect(service.update(1, updateDto, mockUser))
        .rejects
        .toThrow(BusinessException);
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      mockTicketsRepository.findOne.mockResolvedValue(null);
      const updateDto = { status: TicketStatus.IN_PROGRESS };

      await expect(service.update(1, updateDto, mockUser))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should allow technician to update only status of assigned ticket', async () => {
      const techUser = { sub: 2, role: 'TECHNICIAN' };
      const updateDto = { status: TicketStatus.IN_PROGRESS };
      const updatedTicket = { ...mockTicket, status: TicketStatus.IN_PROGRESS };

      mockTicketsRepository.findOne
        .mockResolvedValueOnce(mockTicket)
        .mockResolvedValueOnce(updatedTicket);
      mockTicketsRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.update(1, updateDto, techUser);

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should throw BadRequestException when technician tries to update non-status field', async () => {
      const techUser = { sub: 2, role: 'TECHNICIAN' };
      const updateDto = { title: 'New Title', status: TicketStatus.IN_PROGRESS };

      await expect(service.update(1, updateDto, techUser))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const mockTickets = [
      { id: 1, title: 'Ticket 1', status: TicketStatus.OPEN },
      { id: 2, title: 'Ticket 2', status: TicketStatus.IN_PROGRESS },
    ] as Ticket[];

    it('should return all tickets for ADMIN', async () => {
      const adminUser = { sub: 1, role: 'ADMIN' };
      mockTicketsRepository.find.mockResolvedValue(mockTickets);

      const result = await service.findAll(adminUser);

      expect(mockTicketsRepository.find).toHaveBeenCalledWith({
        relations: ['client', 'technician', 'category', 'createdBy'],
      });
      expect(result).toEqual(mockTickets);
    });

    it('should return only assigned tickets for TECHNICIAN', async () => {
      const techUser = { sub: 1, role: 'TECHNICIAN' };
      const userWithTech = {
        id: 1,
        technicianProfile: { id: 1 },
      };

      mockUsersRepository.findOne.mockResolvedValue(userWithTech);
      mockTicketsRepository.find.mockResolvedValue(mockTickets);

      const result = await service.findAll(techUser);

      expect(result).toEqual(mockTickets);
    });
  });

  describe('findOne', () => {
    const mockTicket = {
      id: 1,
      title: 'Test Ticket',
      status: TicketStatus.OPEN,
      client: { user: { id: 1 } },
      technician: { user: { id: 2 } },
    } as any;

    it('should return ticket for ADMIN', async () => {
      const adminUser = { sub: 1, role: 'ADMIN' };
      mockTicketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOne(1, adminUser);

      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      const adminUser = { sub: 1, role: 'ADMIN' };
      mockTicketsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, adminUser))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete ticket', async () => {
      mockTicketsRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(1);

      expect(mockTicketsRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
