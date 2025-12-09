import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Role, RoleType } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Client } from '../../modules/clients/entities/client.entity';
import { Technician } from '../../modules/technicians/entities/technician.entity';
import { Ticket, TicketStatus, PriorityLevel } from '../../modules/tickets/entities/ticket.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'techhelpdesk',
    entities: [Role, User, Category, Client, Technician, Ticket],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // 1. Crear Roles
    console.log('Creando roles...');
    const roleRepository = dataSource.getRepository(Role);
    
    const adminRole = roleRepository.create({ name: RoleType.ADMIN });
    const technicianRole = roleRepository.create({ name: RoleType.TECHNICIAN });
    const clientRole = roleRepository.create({ name: RoleType.CLIENT });
    
    await roleRepository.save([adminRole, technicianRole, clientRole]);
    console.log('Roles creados');

    // 2. Crear Categorías
    console.log('Creando categorías...');
    const categoryRepository = dataSource.getRepository(Category);
    
    const categories = categoryRepository.create([
      { name: 'Hardware', description: 'Problemas relacionados con hardware de computadoras' },
      { name: 'Software', description: 'Problemas de software y aplicaciones' },
      { name: 'Red', description: 'Problemas de conectividad y redes' },
      { name: 'Impresoras', description: 'Problemas con impresoras y escáneres' },
      { name: 'Correo electrónico', description: 'Problemas con cuentas de correo' },
      { name: 'Acceso', description: 'Problemas de acceso y permisos' },
    ]);
    
    await categoryRepository.save(categories);
    console.log('Categorías creadas');

    // 3. Crear Usuarios
    console.log('Creando usuarios...');
    const userRepository = dataSource.getRepository(User);
    
    // Usuario Admin
    const adminUser = userRepository.create({
      name: 'Administrador Sistema',
      email: 'admin@techhelpdesk.com',
      password: 'admin123',
      role: adminRole,
    });

    // Usuarios Técnicos
    const techUser1 = userRepository.create({
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@techhelpdesk.com',
      password: 'tech123',
      role: technicianRole,
    });

    const techUser2 = userRepository.create({
      name: 'Ana Martínez',
      email: 'ana.martinez@techhelpdesk.com',
      password: 'tech123',
      role: technicianRole,
    });

    const techUser3 = userRepository.create({
      name: 'Luis Gómez',
      email: 'luis.gomez@techhelpdesk.com',
      password: 'tech123',
      role: technicianRole,
    });

    // Usuarios Clientes
    const clientUser1 = userRepository.create({
      name: 'María González',
      email: 'maria.gonzalez@empresa.com',
      password: 'client123',
      role: clientRole,
    });

    const clientUser2 = userRepository.create({
      name: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      password: 'client123',
      role: clientRole,
    });

    const clientUser3 = userRepository.create({
      name: 'Laura Sánchez',
      email: 'laura.sanchez@empresa.com',
      password: 'client123',
      role: clientRole,
    });

    const clientUser4 = userRepository.create({
      name: 'Pedro Torres',
      email: 'pedro.torres@startup.com',
      password: 'client123',
      role: clientRole,
    });

    await userRepository.save([
      adminUser,
      techUser1, techUser2, techUser3,
      clientUser1, clientUser2, clientUser3, clientUser4,
    ]);
    console.log('Usuarios creados');

    // 4. Crear Técnicos (perfiles)
    console.log('Creando perfiles de técnicos...');
    const technicianRepository = dataSource.getRepository(Technician);
    
    const technician1 = technicianRepository.create({
      name: 'Carlos Rodríguez',
      specialty: 'Hardware y Redes',
      availability: true,
      user: techUser1,
    });

    const technician2 = technicianRepository.create({
      name: 'Ana Martínez',
      specialty: 'Software y Aplicaciones',
      availability: true,
      user: techUser2,
    });

    const technician3 = technicianRepository.create({
      name: 'Luis Gómez',
      specialty: 'Sistemas y Seguridad',
      availability: false,
      user: techUser3,
    });

    await technicianRepository.save([technician1, technician2, technician3]);
    console.log('Perfiles de técnicos creados');

    // 5. Crear Clientes (perfiles)
    console.log('Creando perfiles de clientes...');
    const clientRepository = dataSource.getRepository(Client);
    
    const client1 = clientRepository.create({
      name: 'María González',
      company: 'Empresa Solutions S.A.',
      contactEmail: 'maria.gonzalez@empresa.com',
      user: clientUser1,
    });

    const client2 = clientRepository.create({
      name: 'Juan Pérez',
      company: 'Empresa Solutions S.A.',
      contactEmail: 'juan.perez@empresa.com',
      user: clientUser2,
    });

    const client3 = clientRepository.create({
      name: 'Laura Sánchez',
      company: 'Tech Innovators Corp.',
      contactEmail: 'laura.sanchez@empresa.com',
      user: clientUser3,
    });

    const client4 = clientRepository.create({
      name: 'Pedro Torres',
      company: 'Startup Digital',
      contactEmail: 'pedro.torres@startup.com',
      user: clientUser4,
    });

    await clientRepository.save([client1, client2, client3, client4]);
    console.log('Perfiles de clientes creados');

    // 6. Crear Tickets
    console.log('Creando tickets...');
    const ticketRepository = dataSource.getRepository(Ticket);
    
    const tickets = ticketRepository.create([
      {
        title: 'Computadora no enciende',
        description: 'Mi computadora de escritorio no enciende desde esta mañana. Escucho un pitido cuando presiono el botón de encendido.',
        status: TicketStatus.OPEN,
        priority: PriorityLevel.HIGH,
        client: client1,
        category: categories[0], // Hardware
        createdBy: clientUser1,
      },
      {
        title: 'No puedo acceder a mi correo',
        description: 'Desde ayer no puedo acceder a mi cuenta de correo electrónico. Me dice que la contraseña es incorrecta.',
        status: TicketStatus.IN_PROGRESS,
        priority: PriorityLevel.MEDIUM,
        client: client1,
        technician: technician2,
        category: categories[4], // Correo electrónico
        createdBy: clientUser1,
      },
      {
        title: 'Impresora no imprime',
        description: 'La impresora del segundo piso no está imprimiendo. Los documentos se quedan en cola.',
        status: TicketStatus.OPEN,
        priority: PriorityLevel.MEDIUM,
        client: client2,
        category: categories[3], // Impresoras
        createdBy: clientUser2,
      },
      {
        title: 'Internet muy lento',
        description: 'La conexión a internet está muy lenta desde hace dos días. Afecta a todo el departamento.',
        status: TicketStatus.IN_PROGRESS,
        priority: PriorityLevel.HIGH,
        client: client3,
        technician: technician1,
        category: categories[2], // Red
        createdBy: clientUser3,
      },
      {
        title: 'Error al instalar software',
        description: 'No puedo instalar el nuevo software de contabilidad. Me aparece un error de permisos.',
        status: TicketStatus.OPEN,
        priority: PriorityLevel.LOW,
        client: client2,
        category: categories[1], // Software
        createdBy: clientUser2,
      },
      {
        title: 'Pantalla parpadeando',
        description: 'El monitor de mi computadora está parpadeando constantemente. Es difícil trabajar así.',
        status: TicketStatus.RESOLVED,
        priority: PriorityLevel.MEDIUM,
        client: client4,
        technician: technician1,
        category: categories[0], // Hardware
        createdBy: clientUser4,
      },
      {
        title: 'Solicitud de acceso a carpeta compartida',
        description: 'Necesito acceso a la carpeta compartida de finanzas para revisar los reportes mensuales.',
        status: TicketStatus.CLOSED,
        priority: PriorityLevel.LOW,
        client: client3,
        technician: technician3,
        category: categories[5], // Acceso
        createdBy: clientUser3,
      },
      {
        title: 'Aplicación se cierra inesperadamente',
        description: 'La aplicación de CRM se cierra sola cada vez que intento generar un reporte.',
        status: TicketStatus.OPEN,
        priority: PriorityLevel.HIGH,
        client: client4,
        category: categories[1], // Software
        createdBy: clientUser4,
      },
    ]);

    await ticketRepository.save(tickets);
    console.log('Tickets creados');

    console.log('¡Seed completado exitosamente!');
    console.log(`
    📊 Resumen:
    - ${await roleRepository.count()} roles
    - ${await userRepository.count()} usuarios
    - ${await categoryRepository.count()} categorías
    - ${await clientRepository.count()} clientes
    - ${await technicianRepository.count()} técnicos
    - ${await ticketRepository.count()} tickets
    `);

  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await dataSource.destroy();
    console.log('Conexión cerrada');
  }
}

// Ejecutar el seed
seed();