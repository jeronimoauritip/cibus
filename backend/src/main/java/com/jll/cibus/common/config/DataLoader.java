package com.jll.cibus.common.config;

import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.credential.entity.CredentialsEntity;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.order.entity.OrderStatusEntity;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.order.repository.OrderStatusRepository;
import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import com.jll.cibus.orderdetail.repository.OrderDetailRepository;
import com.jll.cibus.payment.entity.PaymentMethodEntity;
import com.jll.cibus.payment.repository.PaymentMethodRepository;
import com.jll.cibus.productcategory.entity.ProductCategoryEntity;
import com.jll.cibus.productcategory.repository.ProductCategoryRepository;
import com.jll.cibus.product.entity.ProductEntity;
import com.jll.cibus.product.repository.ProductRepository;
import com.jll.cibus.role.entity.PermitEntity;
import com.jll.cibus.role.entity.RoleEntity;
import com.jll.cibus.role.enums.Permits;
import com.jll.cibus.role.enums.Roles;
import com.jll.cibus.role.repository.PermitRepository;
import com.jll.cibus.role.repository.RoleRepository;
import com.jll.cibus.table.entity.TableEntity;
import com.jll.cibus.table.repository.TableRepository;
import com.jll.cibus.user.entity.UserEntity;
import com.jll.cibus.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Configuration
public class DataLoader {

        @Bean
        CommandLineRunner initDatabase(

                        ProductRepository productRepository,
                        ProductCategoryRepository categoryRepository,
                        RoleRepository roleRepository,
                        PermitRepository permitRepository,
                        PaymentMethodRepository paymentMethodRepository,
                        OrderStatusRepository orderStatusRepository,
                        BranchRepository branchRepository,
                        UserRepository userRepository,
                        CredentialsRepository credentialsRepository,
                        PasswordEncoder passwordEncoder,
                        OrderRepository orderRepository,
                        OrderDetailRepository orderDetailRepository,
                        TableRepository tableRepository) {

                return args -> {

                        if (branchRepository.count() == 0) {

                                List<BranchEntity> branches = List.of(

                                                BranchEntity.builder()
                                                                .name("Sucursal Centro")
                                                                .street("San Martín")
                                                                .number(1234)
                                                                .build(),

                                                BranchEntity.builder()
                                                                .name("Sucursal Norte")
                                                                .street("Independencia")
                                                                .number(567)
                                                                .build(),

                                                BranchEntity.builder()
                                                                .name("Sucursal Sur")
                                                                .street("Belgrano")
                                                                .number(890)
                                                                .build());

                                branchRepository.saveAll(branches);

                                System.out.println("Sucursales cargadas correctamente.");
                        }

                        if (categoryRepository.count() == 0) {

                                ProductCategoryEntity catPlatos = ProductCategoryEntity.builder()
                                                .name("Platos Principales").build();
                                ProductCategoryEntity catBebidas = ProductCategoryEntity.builder().name("Bebidas")
                                                .build();
                                ProductCategoryEntity catPostres = ProductCategoryEntity.builder().name("Postres")
                                                .build();
                                ProductCategoryEntity catEntradas = ProductCategoryEntity.builder().name("Entradas")
                                                .build();

                                categoryRepository.saveAll(List.of(
                                                catPlatos,
                                                catBebidas,
                                                catPostres,
                                                catEntradas));

                                List<ProductEntity> menuCompleto = List.of(

                                                ProductEntity.builder()
                                                                .name("Empanadas de Carne")
                                                                .description("Dos empanadas cortadas a cuchillo fritas o al horno.")
                                                                .category(catEntradas)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Provoleta Especial")
                                                                .description("Provolone fundido con tomates cherry y albahaca.")
                                                                .category(catEntradas)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Bastones de Mozzarella")
                                                                .description("Seis bastones fritos con salsa pomodoro.")
                                                                .category(catEntradas)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Milanesa con Papas Fritas")
                                                                .description("Milanesa de ternera XL acompañada de papas bastón.")
                                                                .category(catPlatos)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Ravioles de Espinaca")
                                                                .description("Pasta casera con salsa bolognesa o blanca.")
                                                                .category(catPlatos)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Entraña con Ensalada")
                                                                .description("Corte de entraña grillada con mix de verdes.")
                                                                .category(catPlatos)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Risotto de Hongos")
                                                                .description("Arroz cremoso con champiñones y portobellos.")
                                                                .category(catPlatos)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Agua Mineral 500ml")
                                                                .description("Con o sin gas.")
                                                                .category(catBebidas)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Cerveza Artesanal IPA")
                                                                .description("Pinta de cerveza artesanal amarga y aromática.")
                                                                .category(catBebidas)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Limonada con Menta")
                                                                .description("Jarra de 1 litro con jengibre y menta fresca.")
                                                                .category(catBebidas)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Vino Malbec")
                                                                .description("Copa de vino tinto de la casa.")
                                                                .category(catBebidas)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Tiramisú")
                                                                .description("Postre clásico italiano con café y mascarpone.")
                                                                .category(catPostres)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Flan Casero")
                                                                .description("Con dulce de leche y crema batida.")
                                                                .category(catPostres)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Volcán de Chocolate")
                                                                .description("Bizcocho caliente con centro líquido y helado de crema.")
                                                                .category(catPostres)
                                                                .build(),

                                                ProductEntity.builder()
                                                                .name("Ensalada de Frutas")
                                                                .description("Frutas de estación seleccionadas.")
                                                                .category(catPostres)
                                                                .build());

                                productRepository.saveAll(menuCompleto);

                                System.out.println("Menú cargado correctamente.");
                        }

                        if (roleRepository.count() == 0) {
                                Map<Permits, PermitEntity> permits = new EnumMap<>(Permits.class);
                                for (Permits p : Permits.values()) {
                                        PermitEntity pe = PermitEntity.builder().permit(p).build();
                                        permitRepository.save(pe);
                                        permits.put(p, pe);
                                }
                                for (Roles role : Roles.values()) {
                                        RoleEntity roleEntity = new RoleEntity(role);
                                        role.getPermits().forEach(permit -> roleEntity.addPermit(permits.get(permit)));
                                        roleRepository.save(roleEntity);
                                }
                                System.out.println("Roles y permisos cargados correctamente.");
                        }

                        if (!credentialsRepository.existsByUsername("admin@gmail.com") && !userRepository.existsByDni(0L) && !userRepository.existsByEmail("admin@gmail.com")) {

                                RoleEntity adminRole = roleRepository.findByRole(Roles.ADMIN)

                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: create admin user failed"));
                                UserEntity admin = UserEntity.builder()
                                                .dni(0L)
                                                .role(adminRole)
                                                .firstName("admin")
                                                .lastName("master")
                                                .phoneNumber("1111111111")
                                                .email("admin@gmail.com")
                                                .build();
                                userRepository.save(admin);

                                CredentialsEntity credentials = CredentialsEntity.builder()
                                                .username("admin@gmail.com")
                                                .password(passwordEncoder.encode("admin1234"))
                                                .enabled(Boolean.TRUE)
                                                .user(admin)
                                                .roles(Set.of(adminRole))
                                                .build();
                                credentialsRepository.save(credentials);

                                System.out.println("Admin cargado correctamente");
                        }

                        if (!credentialsRepository.existsByUsername("manager@gmail.com") && !userRepository.existsByDni(1L) && !userRepository.existsByEmail("manager@gmail.com")) {

                                BranchEntity branch = branchRepository.findById(1L)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: branch not found"));

                                RoleEntity managerRole = roleRepository.findByRole(Roles.MANAGER)

                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: create manager user failed"));
                                UserEntity manager = UserEntity.builder()
                                                .branch(branch)
                                                .dni(1L)
                                                .role(managerRole)
                                                .firstName("manager")
                                                .lastName("master")
                                                .phoneNumber("2222222222")
                                                .email("manager@gmail.com")
                                                .build();
                                userRepository.save(manager);

                                CredentialsEntity credentials = CredentialsEntity.builder()
                                                .username("manager@gmail.com")
                                                .password(passwordEncoder.encode("1234"))
                                                .enabled(Boolean.TRUE)
                                                .user(manager)
                                                .roles(Set.of(managerRole))
                                                .build();
                                credentialsRepository.save(credentials);

                                System.out.println("Manager cargado correctamente");
                        }

                        if (!credentialsRepository.existsByUsername("1111") && !userRepository.existsByDni(2L) && !userRepository.existsByEmail("waiter@gmail.com")) {

                                BranchEntity branch = branchRepository.findById(1L)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: branch not found"));

                                RoleEntity waiterRole = roleRepository.findByRole(Roles.WAITER)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: create waiter user failed"));

                                UserEntity waiter = UserEntity.builder()
                                                .branch(branch)
                                                .dni(2L)
                                                .role(waiterRole)
                                                .firstName("waiter")
                                                .lastName("master")
                                                .phoneNumber("3333333333")
                                                .email("waiter@gmail.com")
                                                .build();
                                userRepository.save(waiter);

                                CredentialsEntity credentials = CredentialsEntity.builder()
                                                .username("1111")
                                                .password(passwordEncoder.encode("1111"))
                                                .enabled(Boolean.TRUE)
                                                .user(waiter)
                                                .roles(Set.of(waiterRole))
                                                .build();
                                credentialsRepository.save(credentials);

                                System.out.println("Waiter cargado correctamente");
                        }

                        if (!credentialsRepository.existsByUsername("2222") && !userRepository.existsByDni(3L) && !userRepository.existsByEmail("host@gmail.com")) {

                                BranchEntity branch = branchRepository.findById(1L)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: branch not found"));

                                RoleEntity hostRole = roleRepository.findByRole(Roles.HOST)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: create host user failed"));

                                UserEntity host = UserEntity.builder()
                                                .branch(branch)
                                                .dni(3L)
                                                .role(hostRole)
                                                .firstName("host")
                                                .lastName("master")
                                                .phoneNumber("4444444444")
                                                .email("host@gmail.com")
                                                .build();
                                userRepository.save(host);

                                CredentialsEntity credentials = CredentialsEntity.builder()
                                                .username("2222")
                                                .password(passwordEncoder.encode("2222"))
                                                .enabled(Boolean.TRUE)
                                                .user(host)
                                                .roles(Set.of(hostRole))
                                                .build();
                                credentialsRepository.save(credentials);

                                System.out.println("Host cargado correctamente");
                        }

                        if (!credentialsRepository.existsByUsername("3333") && !userRepository.existsByDni(4L) && !userRepository.existsByEmail("kitchen@gmail.com")) {

                                BranchEntity branch = branchRepository.findById(1L)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: branch not found"));

                                RoleEntity kitchenRole = roleRepository.findByRole(Roles.KITCHEN)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Error: create kitchen user failed"));

                                UserEntity kitchen = UserEntity.builder()
                                                .branch(branch)
                                                .dni(4L)
                                                .role(kitchenRole)
                                                .firstName("kitchen")
                                                .lastName("master")
                                                .phoneNumber("5555555555")
                                                .email("kitchen@gmail.com")
                                                .build();
                                userRepository.save(kitchen);

                                CredentialsEntity credentials = CredentialsEntity.builder()
                                                .username("3333")
                                                .password(passwordEncoder.encode("3333"))
                                                .enabled(Boolean.TRUE)
                                                .user(kitchen)
                                                .roles(Set.of(kitchenRole))
                                                .build();
                                credentialsRepository.save(credentials);

                                System.out.println("kitchen cargado correctamente");
                        }

                        if (paymentMethodRepository.count() == 0) {

                                List<PaymentMethodEntity> payments = List.of(

                                                PaymentMethodEntity.builder()
                                                                .name("EFECTIVO")
                                                                .build(),

                                                PaymentMethodEntity.builder()
                                                                .name("CREDITO")
                                                                .build(),

                                                PaymentMethodEntity.builder()
                                                                .name("DEBITO")
                                                                .build(),

                                                PaymentMethodEntity.builder()
                                                                .name("MERCADO PAGO")
                                                                .build());

                                paymentMethodRepository.saveAll(payments);

                                System.out.println("Medios de pago cargados correctamente.");
                        }
                        if (orderStatusRepository.count() == 0) {
                                List<OrderStatusEntity> orderStatus = List.of(
                                                OrderStatusEntity.builder()
                                                                .name("PENDING")
                                                                .build(),
                                                OrderStatusEntity.builder()
                                                                .name("PREPARING")
                                                                .build(),
                                                OrderStatusEntity.builder()
                                                                .name("READY")
                                                                .build(),
                                                OrderStatusEntity.builder()
                                                                .name("SERVED")
                                                                .build(),
                                                OrderStatusEntity.builder()
                                                                .name("PAID")
                                                                .build(),
                                                OrderStatusEntity.builder()
                                                                .name("CANCELLED")
                                                                .build());

                                orderStatusRepository.saveAll(orderStatus);

                                System.out.println("Estados de orden cargados correctamente.");
                        }

                        if (tableRepository.count() == 0) {
                                BranchEntity sucursalCentro = branchRepository.findAll().stream().findFirst()
                                                .orElseThrow();
                                UserEntity adminMozo = userRepository.findAll().stream().findFirst().orElseThrow();

                                List<TableEntity> mesas = new ArrayList<>();
                                for (int i = 1; i <= 5; i++) {
                                        int posX = 50 + ((i - 1) * 150);
                                        int posY = 100;
                                        mesas.add(TableEntity.builder()
                                                        .number(i)
                                                        .capacity(i % 2 == 0 ? 4 : 2)
                                                        .available(true)
                                                        .posX(posX)
                                                        .posY(posY)
                                                        .waiter(adminMozo)
                                                        .branch(sucursalCentro)
                                                        .build());
                                }
                                tableRepository.saveAll(mesas);
                                System.out.println("Mesas cargadas correctamente.");
                        }

                        if (orderRepository.count() == 0) {

                                BranchEntity sucursal = branchRepository.findAll().get(0);
                                UserEntity mozo = userRepository.findAll().get(0);
                                List<TableEntity> mesas = tableRepository.findAll();
                                List<OrderStatusEntity> estados = orderStatusRepository.findAll();
                                List<ProductEntity> productos = productRepository.findAll();

                                List<OrderDetailEntity> todosLosDetalles = new ArrayList<>();
                                Random random = new Random();

                                for (int i = 1; i <= 10; i++) {
                                        TableEntity mesaAleatoria = mesas.get(random.nextInt(mesas.size()));
                                        List<OrderStatusEntity> estadosSinPendingNiPaid = estados.stream()
                                                        .filter(e -> !e.getName().equalsIgnoreCase("pending"))
                                                        .filter(e -> !e.getName().equalsIgnoreCase("paid"))
                                                        .toList();
                                        OrderStatusEntity estadoAleatorio = estadosSinPendingNiPaid
                                                        .get(random.nextInt(estadosSinPendingNiPaid.size()));

                                        ProductEntity producto1 = productos.get(random.nextInt(productos.size() / 2));
                                        ProductEntity producto2 = productos.get(
                                                        productos.size() / 2 + random.nextInt(productos.size() / 2));

                                        BigDecimal precioP1 = BigDecimal.valueOf(3000 + random.nextInt(2000));
                                        BigDecimal precioP2 = BigDecimal.valueOf(1500 + random.nextInt(1500));
                                        int cant1 = 1 + random.nextInt(3);
                                        int cant2 = 1 + random.nextInt(2);

                                        BigDecimal subtotal1 = precioP1.multiply(BigDecimal.valueOf(cant1));
                                        BigDecimal subtotal2 = precioP2.multiply(BigDecimal.valueOf(cant2));
                                        BigDecimal subtotalOrden = subtotal1.add(subtotal2);

                                        BigDecimal descuento = (i % 2 == 0) ? new BigDecimal("1000.00")
                                                        : BigDecimal.ZERO;
                                        BigDecimal totalFinal = subtotalOrden.subtract(descuento);

                                        int diasAtras = random.nextInt(30) + 1;
                                        int horaComida = 12 + random.nextInt(11);

                                        LocalDateTime fechaCreacion = LocalDateTime.now()
                                                        .minusDays(diasAtras)
                                                        .withHour(horaComida)
                                                        .withMinute(random.nextInt(60))
                                                        .withSecond(0)
                                                        .withNano(0);

                                        LocalDateTime fechaCierre = null;
                                        String nombreEstado = estadoAleatorio.getName();

                                        if (nombreEstado.equals("PAID") || nombreEstado.equals("CANCELLED")) {
                                                int minutosMesa = 40 + random.nextInt(80);
                                                fechaCierre = fechaCreacion.plusMinutes(minutosMesa);
                                        }

                                        OrderEntity orden = OrderEntity.builder()
                                                        .branch(sucursal)
                                                        .table(mesaAleatoria)
                                                        .waiter(mozo)
                                                        .status(estadoAleatorio)
                                                        .subtotal(subtotalOrden)
                                                        .discount(descuento)
                                                        .finalTotal(totalFinal)
                                                        .createdAt(fechaCreacion)
                                                        .closedAt(fechaCierre)
                                                        .build();

                                        orderRepository.save(orden);

                                        OrderDetailEntity detalle1 = OrderDetailEntity.builder()
                                                        .order(orden)
                                                        .product(producto1)
                                                        .quantity(cant1)
                                                        .unitPrice(precioP1)
                                                        .observation((i == 3 || i == 7) ? "Para compartir, por favor."
                                                                        : null)
                                                        .build();

                                        OrderDetailEntity detalle2 = OrderDetailEntity.builder()
                                                        .order(orden)
                                                        .product(producto2)
                                                        .quantity(cant2)
                                                        .unitPrice(precioP2)
                                                        .build();

                                        todosLosDetalles.add(detalle1);
                                        todosLosDetalles.add(detalle2);
                                }

                                orderDetailRepository.saveAll(todosLosDetalles);
                                System.out.println("10 Órdenes y sus detalles generados correctamente.");
                        }
                };
        }
}
