package com.jll.cibus.common.config;

import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.branchproduct.entity.BranchProductEntity;
import com.jll.cibus.branchproduct.repository.BranchProductRepository;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.credential.entity.CredentialsEntity;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.order.entity.OrderStatusEntity;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.order.repository.OrderStatusRepository;
import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import com.jll.cibus.orderdetail.repository.OrderDetailRepository;
import com.jll.cibus.payment.entity.OrderPaymentEntity;
import com.jll.cibus.payment.entity.PaymentMethodEntity;
import com.jll.cibus.payment.repository.OrderPaymentRepository;
import com.jll.cibus.payment.repository.PaymentMethodRepository;
import com.jll.cibus.product.entity.ProductEntity;
import com.jll.cibus.product.repository.ProductRepository;
import com.jll.cibus.productcategory.entity.ProductCategoryEntity;
import com.jll.cibus.productcategory.repository.ProductCategoryRepository;
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
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            TransactionTemplate transactionTemplate,
            ProductRepository productRepository,
            ProductCategoryRepository categoryRepository,
            BranchProductRepository branchProductRepository,
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
            OrderPaymentRepository orderPaymentRepository,
            TableRepository tableRepository) {

        return args -> {
            transactionTemplate.execute(status -> {
                // 1. SUCURSALES (BRANCHES)
                List<BranchEntity> branches = loadBranches(branchRepository);

                // 2. CATEGORÍAS Y PRODUCTOS BASE (CATALOG)
                Map<String, ProductEntity> catalog = loadCategoriesAndProducts(categoryRepository, productRepository);

                // 3. MENÚS POR SUCURSAL (BRANCH PRODUCTS)
                loadBranchProducts(branchRepository, productRepository, branchProductRepository);

                // 4. ROLES Y PERMISOS
                Map<Roles, RoleEntity> rolesMap = loadRolesAndPermits(roleRepository, permitRepository);

                // 5. MEDIOS DE PAGO Y ESTADOS DE ORDEN
                List<PaymentMethodEntity> paymentMethods = loadPaymentMethods(paymentMethodRepository);
                Map<String, OrderStatusEntity> orderStatuses = loadOrderStatuses(orderStatusRepository);

                // 6. EMPLEADOS Y CREDENCIALES POR SUCURSAL
                Map<Long, List<UserEntity>> branchWaiters = loadUsersAndCredentials(
                        branches, rolesMap, userRepository, credentialsRepository, passwordEncoder);

                // 7. MESAS POR SUCURSAL
                Map<Long, List<TableEntity>> branchTables = loadTables(branches, branchWaiters, tableRepository);

                // 8. PEDIDOS, DETALLES Y PAGOS (ACTIVOS E HISTÓRICOS)
                loadOrders(branches, branchTables, branchWaiters, catalog, orderStatuses, paymentMethods,
                        orderRepository, orderDetailRepository, orderPaymentRepository);

                System.out.println(">>> DataLoader completado exitosamente con datos completos para todas las sucursales. <<<");
                return null;
            });
        };
    }

    // =========================================================================
    // 1. SUCURSALES
    // =========================================================================
    private List<BranchEntity> loadBranches(BranchRepository branchRepository) {
        List<BranchDefinition> branchDefs = List.of(
                new BranchDefinition("Sucursal Centro", "San Martín", 1234),
                new BranchDefinition("Sucursal Norte", "Independencia", 567),
                new BranchDefinition("Sucursal Sur", "Belgrano", 890),
                new BranchDefinition("Sucursal Palermo", "Av. Santa Fe", 3420)
        );

        List<BranchEntity> result = new ArrayList<>();
        for (BranchDefinition def : branchDefs) {
            BranchEntity branch = branchRepository.findByName(def.name())
                    .orElseGet(() -> branchRepository.save(
                            BranchEntity.builder()
                                    .name(def.name())
                                    .street(def.street())
                                    .number(def.number())
                                    .build()
                    ));
            result.add(branch);
        }
        System.out.println("Sucursales sincronizadas: " + result.size());
        return result;
    }

    private record BranchDefinition(String name, String street, int number) {}

    // =========================================================================
    // 2. CATEGORÍAS Y PRODUCTOS BASE
    // =========================================================================
    private Map<String, ProductEntity> loadCategoriesAndProducts(
            ProductCategoryRepository categoryRepository,
            ProductRepository productRepository) {

        Map<String, ProductCategoryEntity> catMap = new HashMap<>();
        List<String> categoryNames = List.of(
                "Entradas",
                "Platos Principales",
                "Pastas Caseras",
                "Hamburguesas y Sandwiches",
                "Guarniciones",
                "Bebidas Sin Alcohol",
                "Cervezas y Tragos",
                "Vinos",
                "Postres",
                "Cafetería"
        );

        for (String cName : categoryNames) {
            ProductCategoryEntity cat = categoryRepository.findByNameIgnoreCase(cName)
                    .orElseGet(() -> categoryRepository.save(ProductCategoryEntity.builder().name(cName).build()));
            catMap.put(cName, cat);
        }

        List<ProductDefinition> productDefs = List.of(
                // Entradas
                new ProductDefinition("Empanadas de Carne Criolla", "Empanadas tradicionales cortadas a cuchillo fritas o al horno.", "Entradas"),
                new ProductDefinition("Empanadas de Jamón y Queso", "Masa hojaldrada rellena con mozzarella y jamón cocido natural.", "Entradas"),
                new ProductDefinition("Provoleta Especial Cibus", "Queso provolone fundido al oreganato con tomates cherry y oliva.", "Entradas"),
                new ProductDefinition("Bastones de Mozzarella", "Seis bastones rebozados y crocantes con salsa pomodoro.", "Entradas"),
                new ProductDefinition("Rabas a la Romana", "Tiernos aros de calamar crocantes con salsa tártara y gajos de limón.", "Entradas"),
                new ProductDefinition("Tabla de Fiambres y Quesos", "Jamón crudo, salame tandilero, queso gouda, azul, olivas y pan casero.", "Entradas"),

                // Platos Principales
                new ProductDefinition("Bife de Chorizo Angus (400g)", "Corte vacuno premium a las brasas con chimichurri casero.", "Platos Principales"),
                new ProductDefinition("Ojo de Bife con Papas Rústicas", "Ojo de bife tierno al punto deseado con papas asadas a las hierbas.", "Platos Principales"),
                new ProductDefinition("Entraña Grillada", "Corte jugoso a la parrilla con emulsión criolla y limón.", "Platos Principales"),
                new ProductDefinition("Milanesa Napolitana Cibus", "Milanesa de ternera XL con salsa pomodoro, jamón, mozzarella y orégano.", "Platos Principales"),
                new ProductDefinition("Milanesa con Papas Fritas", "Clásica milanesa dorada acompañada de generosas papas bastón.", "Platos Principales"),
                new ProductDefinition("Suprema a la Suiza", "Suprema de pollo gratinada con salsa bechamel, mozzarella y jamón cocido.", "Platos Principales"),
                new ProductDefinition("Salmón Rosado a la Plancha", "Filet fresco grillado con manteca de hierbas y vegetales asados.", "Platos Principales"),
                new ProductDefinition("Risotto de Hongos y Parmesano", "Arroz carnaroli cremoso con champiñones, portobellos y parmesano reggiano.", "Platos Principales"),

                // Pastas Caseras
                new ProductDefinition("Ravioles de Espinaca y Ricota", "Ravioles frescos con salsa bolognesa tradicional o crema suave.", "Pastas Caseras"),
                new ProductDefinition("Sorrentinos de Jamón y Queso", "Masa al huevo rellena de mozzarella y jamón, con salsa cuatro quesos.", "Pastas Caseras"),
                new ProductDefinition("Ñoquis de Papa al Fileto", "Ñoquis artesanales de papa con salsa de tomates maduros y albahaca fresca.", "Pastas Caseras"),
                new ProductDefinition("Fettuccine Frutti di Mare", "Cintas al huevo salteadas con camarones, calamares y vino blanco.", "Pastas Caseras"),
                new ProductDefinition("Lasagna Clásica de Carne", "Capas de pasta casera, salsa bolognesa, bechamel y queso fundido.", "Pastas Caseras"),

                // Hamburguesas y Sandwiches
                new ProductDefinition("Hamburguesa Doble Cibus", "Doble medallón de novillo, cheddar fundido, panceta crocante y salsa especial.", "Hamburguesas y Sandwiches"),
                new ProductDefinition("Hamburguesa Clásica Completa", "Medallón 180g, queso muzzarella, jamón, lechuga, tomate y huevo a la plancha.", "Hamburguesas y Sandwiches"),
                new ProductDefinition("Sandwich de Bondiola Braseada", "Bondiola desmechada braseada 6 horas, barbacoa ahumada y cebolla caramelizada.", "Hamburguesas y Sandwiches"),
                new ProductDefinition("Sandwich Vegetariano Ciabatta", "Vegetales grillados, palta cremosa, queso brie y rúcula en pan ciabatta.", "Hamburguesas y Sandwiches"),

                // Guarniciones
                new ProductDefinition("Papas Fritas Clásicas", "Papas bastón recién hechas, doradas y crujientes.", "Guarniciones"),
                new ProductDefinition("Papas Bravas Cibus", "Cubos crocantes de papa con alioli casero y salsa brava picante.", "Guarniciones"),
                new ProductDefinition("Puré de Papas Cremoso", "Puré suave preparado con manteca de campo y nuez moscada.", "Guarniciones"),
                new ProductDefinition("Ensalada Caesar", "Mix de lechugas, pechuga grillada, croutons, queso parmesano y dressing Caesar.", "Guarniciones"),
                new ProductDefinition("Ensalada Mixta", "Lechuga capuchina fresca, tomate redondo y aros de cebolla morada.", "Guarniciones"),

                // Bebidas Sin Alcohol
                new ProductDefinition("Agua Mineral 500ml", "Agua mineral de manantial con o sin gas.", "Bebidas Sin Alcohol"),
                new ProductDefinition("Limonada con Menta y Jengibre", "Jarra de 1 litro con limones recién exprimidos, menta fresca y jengibre.", "Bebidas Sin Alcohol"),
                new ProductDefinition("Coca Cola 500ml", "Refresco clásico en botella de 500ml.", "Bebidas Sin Alcohol"),
                new ProductDefinition("Coca Cola Zero 500ml", "Refresco sin azúcar en botella de 500ml.", "Bebidas Sin Alcohol"),
                new ProductDefinition("Agua Saborizada Levité Pomelo", "Agua saborizada 500ml.", "Bebidas Sin Alcohol"),

                // Cervezas y Tragos
                new ProductDefinition("Cerveza Artesanal IPA", "Pinta de cerveza artesanal amarga con intenso perfil cítrico y lupulado.", "Cervezas y Tragos"),
                new ProductDefinition("Cerveza Artesanal Golden Ale", "Pinta dorada suave, balanceada y refrescante.", "Cervezas y Tragos"),
                new ProductDefinition("Cerveza Stella Artois 660ml", "Botella de cerveza rubia europea clásica.", "Cervezas y Tragos"),
                new ProductDefinition("Fernet Branca con Cola", "Trago tradicional con abundante hielo y medidas equilibradas.", "Cervezas y Tragos"),
                new ProductDefinition("Gin Tonic Clásico", "Gin premium, agua tónica, bayas de enebro y rodajas de lima fresca.", "Cervezas y Tragos"),
                new ProductDefinition("Aperol Spritz", "Aperol, vino espumante prosecco, soda y rodaja de naranja.", "Cervezas y Tragos"),

                // Vinos
                new ProductDefinition("Vino Malbec Copa", "Copa de vino tinto joven de la casa.", "Vinos"),
                new ProductDefinition("Luigi Bosca Malbec 750ml", "Botella reserva de cuerpo intenso con notas a frutos negros y roble.", "Vinos"),
                new ProductDefinition("Rutini Cabernet Sauvignon 750ml", "Botella de vino tinto estructurado con taninos redondos.", "Vinos"),

                // Postres
                new ProductDefinition("Tiramisú Tradicional", "Postre italiano con capas de vainilla, espresso, mascarpone y cacao.", "Postres"),
                new ProductDefinition("Flan Casero con Dulce y Crema", "Flan de huevos con generosa porción de dulce de leche y crema chantilly.", "Postres"),
                new ProductDefinition("Volcán de Chocolate con Helado", "Bizcocho caliente de chocolate con centro líquido y helado de crema.", "Postres"),
                new ProductDefinition("Cheesecake de Frutos Rojos", "Base crocante con suave crema de queso y coulis de frutos del bosque.", "Postres"),
                new ProductDefinition("Panqueques con Dulce de Leche", "Dos panqueques tibios dorados al momento rellenos con dulce de leche.", "Postres"),

                // Cafetería
                new ProductDefinition("Café Espresso", "Pocillo de café de grano tostado recién molido.", "Cafetería"),
                new ProductDefinition("Café Cortado", "Espresso equilibrado con un toque de leche caliente y suave espuma.", "Cafetería"),
                new ProductDefinition("Capuchino Italiano", "Café espresso, leche cremosa espumada, canela y cacao espolvoreado.", "Cafetería"),
                new ProductDefinition("Submarino con Medialunas", "Vaso con leche bien caliente, barra de chocolate Águila y dos medialunas de manteca.", "Cafetería")
        );

        Map<String, ProductEntity> catalog = new HashMap<>();
        for (ProductDefinition def : productDefs) {
            ProductCategoryEntity cat = catMap.get(def.categoryName());
            ProductEntity product = productRepository.findByNameIgnoreCase(def.name())
                    .orElseGet(() -> productRepository.save(
                            ProductEntity.builder()
                                    .name(def.name())
                                    .description(def.description())
                                    .category(cat)
                                    .build()
                    ));
            catalog.put(def.name(), product);
        }

        System.out.println("Catálogo de productos cargado: " + catalog.size() + " productos.");
        return catalog;
    }

    private record ProductDefinition(String name, String description, String categoryName) {}

    // =========================================================================
    // 3. MENÚS POR SUCURSAL (BRANCH PRODUCTS)
    // =========================================================================
    private void loadBranchProducts(
            BranchRepository branchRepository,
            ProductRepository productRepository,
            BranchProductRepository branchProductRepository) {

        List<BranchEntity> branches = branchRepository.findAll();
        List<ProductEntity> products = productRepository.findAll();

        Map<String, BigDecimal> defaultPrices = getStandardPrices();

        List<BranchProductEntity> toSave = new ArrayList<>();

        for (BranchEntity branch : branches) {
            for (ProductEntity prod : products) {
                if (!branchProductRepository.existsByBranch_IdAndProduct_Id(branch.getId(), prod.getId())) {
                    BigDecimal price = defaultPrices.getOrDefault(prod.getName(), BigDecimal.valueOf(5000));
                    // 1 o 2 productos no disponibles ocasionalmente para probar visualización de faltantes
                    boolean available = !("Salmón Rosado a la Plancha".equals(prod.getName()) && branch.getId() == 2)
                            && !("Rabas a la Romana".equals(prod.getName()) && branch.getId() == 3);

                    toSave.add(BranchProductEntity.builder()
                            .branch(branch)
                            .product(prod)
                            .price(price)
                            .available(available)
                            .build());
                }
            }
        }

        if (!toSave.isEmpty()) {
            branchProductRepository.saveAll(toSave);
            System.out.println("Branch products creados: " + toSave.size() + " asignaciones de menú.");
        }
    }

    private Map<String, BigDecimal> getStandardPrices() {
        Map<String, BigDecimal> prices = new HashMap<>();
        prices.put("Empanadas de Carne Criolla", BigDecimal.valueOf(1800));
        prices.put("Empanadas de Jamón y Queso", BigDecimal.valueOf(1800));
        prices.put("Provoleta Especial Cibus", BigDecimal.valueOf(4800));
        prices.put("Bastones de Mozzarella", BigDecimal.valueOf(4200));
        prices.put("Rabas a la Romana", BigDecimal.valueOf(7900));
        prices.put("Tabla de Fiambres y Quesos", BigDecimal.valueOf(9500));

        prices.put("Bife de Chorizo Angus (400g)", BigDecimal.valueOf(14500));
        prices.put("Ojo de Bife con Papas Rústicas", BigDecimal.valueOf(15200));
        prices.put("Entraña Grillada", BigDecimal.valueOf(13800));
        prices.put("Milanesa Napolitana Cibus", BigDecimal.valueOf(11500));
        prices.put("Milanesa con Papas Fritas", BigDecimal.valueOf(9800));
        prices.put("Suprema a la Suiza", BigDecimal.valueOf(10200));
        prices.put("Salmón Rosado a la Plancha", BigDecimal.valueOf(17800));
        prices.put("Risotto de Hongos y Parmesano", BigDecimal.valueOf(10500));

        prices.put("Ravioles de Espinaca y Ricota", BigDecimal.valueOf(8400));
        prices.put("Sorrentinos de Jamón y Queso", BigDecimal.valueOf(8900));
        prices.put("Ñoquis de Papa al Fileto", BigDecimal.valueOf(7600));
        prices.put("Fettuccine Frutti di Mare", BigDecimal.valueOf(12800));
        prices.put("Lasagna Clásica de Carne", BigDecimal.valueOf(9600));

        prices.put("Hamburguesa Doble Cibus", BigDecimal.valueOf(8900));
        prices.put("Hamburguesa Clásica Completa", BigDecimal.valueOf(7500));
        prices.put("Sandwich de Bondiola Braseada", BigDecimal.valueOf(8600));
        prices.put("Sandwich Vegetariano Ciabatta", BigDecimal.valueOf(6900));

        prices.put("Papas Fritas Clásicas", BigDecimal.valueOf(3800));
        prices.put("Papas Bravas Cibus", BigDecimal.valueOf(4400));
        prices.put("Puré de Papas Cremoso", BigDecimal.valueOf(3200));
        prices.put("Ensalada Caesar", BigDecimal.valueOf(5900));
        prices.put("Ensalada Mixta", BigDecimal.valueOf(3400));

        prices.put("Agua Mineral 500ml", BigDecimal.valueOf(1900));
        prices.put("Limonada con Menta y Jengibre", BigDecimal.valueOf(3800));
        prices.put("Coca Cola 500ml", BigDecimal.valueOf(2300));
        prices.put("Coca Cola Zero 500ml", BigDecimal.valueOf(2300));
        prices.put("Agua Saborizada Levité Pomelo", BigDecimal.valueOf(2100));

        prices.put("Cerveza Artesanal IPA", BigDecimal.valueOf(4200));
        prices.put("Cerveza Artesanal Golden Ale", BigDecimal.valueOf(3900));
        prices.put("Cerveza Stella Artois 660ml", BigDecimal.valueOf(4800));
        prices.put("Fernet Branca con Cola", BigDecimal.valueOf(4500));
        prices.put("Gin Tonic Clásico", BigDecimal.valueOf(5200));
        prices.put("Aperol Spritz", BigDecimal.valueOf(4900));

        prices.put("Vino Malbec Copa", BigDecimal.valueOf(3500));
        prices.put("Luigi Bosca Malbec 750ml", BigDecimal.valueOf(15500));
        prices.put("Rutini Cabernet Sauvignon 750ml", BigDecimal.valueOf(18500));

        prices.put("Tiramisú Tradicional", BigDecimal.valueOf(4500));
        prices.put("Flan Casero con Dulce y Crema", BigDecimal.valueOf(3800));
        prices.put("Volcán de Chocolate con Helado", BigDecimal.valueOf(5200));
        prices.put("Cheesecake de Frutos Rojos", BigDecimal.valueOf(4800));
        prices.put("Panqueques con Dulce de Leche", BigDecimal.valueOf(3900));

        prices.put("Café Espresso", BigDecimal.valueOf(1900));
        prices.put("Café Cortado", BigDecimal.valueOf(2100));
        prices.put("Capuchino Italiano", BigDecimal.valueOf(2800));
        prices.put("Submarino con Medialunas", BigDecimal.valueOf(3500));
        return prices;
    }

    // =========================================================================
    // 4. ROLES Y PERMISOS
    // =========================================================================
    private Map<Roles, RoleEntity> loadRolesAndPermits(
            RoleRepository roleRepository,
            PermitRepository permitRepository) {

        Map<Roles, RoleEntity> roleEntityMap = new HashMap<>();

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
                roleEntityMap.put(role, roleEntity);
            }
            System.out.println("Roles y permisos inicializados.");
        } else {
            for (Roles role : Roles.values()) {
                roleRepository.findByRole(role).ifPresent(re -> roleEntityMap.put(role, re));
            }
        }
        return roleEntityMap;
    }

    // =========================================================================
    // 5. MEDIOS DE PAGO Y ESTADOS
    // =========================================================================
    private List<PaymentMethodEntity> loadPaymentMethods(PaymentMethodRepository paymentMethodRepository) {
        List<String> names = List.of("EFECTIVO", "CREDITO", "DEBITO", "MERCADO PAGO");
        List<PaymentMethodEntity> result = new ArrayList<>();
        for (String name : names) {
            PaymentMethodEntity pm = paymentMethodRepository.findByName(name)
                    .orElseGet(() -> paymentMethodRepository.save(PaymentMethodEntity.builder().name(name).build()));
            result.add(pm);
        }
        return result;
    }

    private Map<String, OrderStatusEntity> loadOrderStatuses(OrderStatusRepository orderStatusRepository) {
        List<String> statusNames = List.of("PENDING", "PREPARING", "READY", "SERVED", "PAID", "CANCELLED");
        Map<String, OrderStatusEntity> result = new HashMap<>();
        for (String name : statusNames) {
            OrderStatusEntity st = orderStatusRepository.findByName(name)
                    .orElseGet(() -> orderStatusRepository.save(OrderStatusEntity.builder().name(name).build()));
            result.put(name.toUpperCase(), st);
        }
        return result;
    }

    // =========================================================================
    // 6. EMPLEADOS Y CREDENCIALES
    // =========================================================================
    private Map<Long, List<UserEntity>> loadUsersAndCredentials(
            List<BranchEntity> branches,
            Map<Roles, RoleEntity> rolesMap,
            UserRepository userRepository,
            CredentialsRepository credentialsRepository,
            PasswordEncoder passwordEncoder) {

        RoleEntity adminRole = rolesMap.get(Roles.ADMIN);
        RoleEntity managerRole = rolesMap.get(Roles.MANAGER);
        RoleEntity waiterRole = rolesMap.get(Roles.WAITER);
        RoleEntity hostRole = rolesMap.get(Roles.HOST);
        RoleEntity kitchenRole = rolesMap.get(Roles.KITCHEN);

        // 1. Admin General
        findOrCreateUserWithCredentials(
                userRepository, credentialsRepository, passwordEncoder,
                0L, "Admin", "Master", "1111111111", "admin@gmail.com",
                adminRole, null, "admin@gmail.com", "admin1234"
        );

        Map<Long, List<UserEntity>> branchWaiters = new HashMap<>();

        // Definiciones de staff por sucursal
        List<BranchStaffDefinition> branchStaffList = List.of(
                new BranchStaffDefinition(
                        0, // Index branch 0: Centro
                        new UserSpec(1L, "Esteban", "Manager", "2222222222", "manager@gmail.com", "manager@gmail.com", "manager1234"),
                        List.of(
                                new UserSpec(2L, "Carlos", "Gómez", "3333333331", "waiter@gmail.com", "1111", "1111"),
                                new UserSpec(10002L, "Valentina", "Ríos", "3333333332", "valentina.rios@cibus.com", "1112", "1112"),
                                new UserSpec(10003L, "Matías", "Giménez", "3333333333", "matias.gimenez@cibus.com", "1113", "1113"),
                                new UserSpec(10004L, "Sofía", "Morales", "3333333334", "sofia.morales@cibus.com", "1114", "1114")
                        ),
                        new UserSpec(3L, "Camila", "Host", "4444444441", "host@gmail.com", "2222", "2222"),
                        new UserSpec(4L, "Jorge", "Cocinero", "5555555551", "kitchen@gmail.com", "3333", "3333")
                ),
                new BranchStaffDefinition(
                        1, // Index branch 1: Norte
                        new UserSpec(20000001L, "Mariana", "López", "2222222223", "manager.norte@cibus.com", "manager.norte@cibus.com", "manager1234"),
                        List.of(
                                new UserSpec(20001L, "Lucas", "Pereyra", "3333333341", "lucas.pereyra@cibus.com", "2111", "2111"),
                                new UserSpec(20002L, "Gonzalo", "Fernández", "3333333342", "gonzalo.fernandez@cibus.com", "2112", "2112"),
                                new UserSpec(20003L, "Florencia", "Díaz", "3333333343", "florencia.diaz@cibus.com", "2113", "2113"),
                                new UserSpec(20004L, "Martina", "Romero", "3333333344", "martina.romero@cibus.com", "2114", "2114")
                        ),
                        new UserSpec(20010L, "Ana", "Recepcionista", "4444444442", "host.norte@cibus.com", "2221", "2221"),
                        new UserSpec(20020L, "Martín", "Chef", "5555555552", "kitchen.norte@cibus.com", "2331", "2331")
                ),
                new BranchStaffDefinition(
                        2, // Index branch 2: Sur
                        new UserSpec(30000001L, "Rodrigo", "Paz", "2222222224", "manager.sur@cibus.com", "manager.sur@cibus.com", "manager1234"),
                        List.of(
                                new UserSpec(30001L, "Julián", "Herrera", "3333333351", "julian.herrera@cibus.com", "3111", "3111"),
                                new UserSpec(30002L, "Lucía", "Castro", "3333333352", "lucia.castro@cibus.com", "3112", "3112"),
                                new UserSpec(30003L, "Tomás", "Benítez", "3333333353", "tomas.benitez@cibus.com", "3113", "3113"),
                                new UserSpec(30004L, "Agustina", "Peralta", "3333333354", "agustina.peralta@cibus.com", "3114", "3114")
                        ),
                        new UserSpec(30010L, "Laura", "Recepcionista", "4444444443", "host.sur@cibus.com", "3221", "3221"),
                        new UserSpec(30020L, "Esteban", "Chef", "5555555553", "kitchen.sur@cibus.com", "3331", "3331")
                ),
                new BranchStaffDefinition(
                        3, // Index branch 3: Palermo (si existe)
                        new UserSpec(40000001L, "Valeria", "Suárez", "2222222225", "manager.palermo@cibus.com", "manager.palermo@cibus.com", "manager1234"),
                        List.of(
                                new UserSpec(40001L, "Santiago", "Medina", "3333333361", "santiago.medina@cibus.com", "4111", "4111"),
                                new UserSpec(40002L, "Paula", "Alvarez", "3333333362", "paula.alvarez@cibus.com", "4112", "4112"),
                                new UserSpec(40003L, "Nicolás", "Rossi", "3333333363", "nicolas.rossi@cibus.com", "4113", "4113"),
                                new UserSpec(40004L, "Antonella", "Ruiz", "3333333364", "antonella.ruiz@cibus.com", "4114", "4114")
                        ),
                        new UserSpec(40010L, "Romina", "Host", "4444444444", "host.palermo@cibus.com", "4221", "4221"),
                        new UserSpec(40020L, "Diego", "Chef", "5555555554", "kitchen.palermo@cibus.com", "4331", "4331")
                )
        );

        for (BranchStaffDefinition staffDef : branchStaffList) {
            if (staffDef.branchIndex() >= branches.size()) continue;
            BranchEntity branch = branches.get(staffDef.branchIndex());

            // Manager
            findOrCreateUserWithCredentials(
                    userRepository, credentialsRepository, passwordEncoder,
                    staffDef.manager().dni(), staffDef.manager().firstName(), staffDef.manager().lastName(),
                    staffDef.manager().phone(), staffDef.manager().email(), managerRole, branch,
                    staffDef.manager().username(), staffDef.manager().rawPassword()
            );

            // Waiters
            List<UserEntity> waiters = new ArrayList<>();
            for (UserSpec wSpec : staffDef.waiters()) {
                UserEntity waiter = findOrCreateUserWithCredentials(
                        userRepository, credentialsRepository, passwordEncoder,
                        wSpec.dni(), wSpec.firstName(), wSpec.lastName(),
                        wSpec.phone(), wSpec.email(), waiterRole, branch,
                        wSpec.username(), wSpec.rawPassword()
                );
                waiters.add(waiter);
            }
            branchWaiters.put(branch.getId(), waiters);

            // Host
            findOrCreateUserWithCredentials(
                    userRepository, credentialsRepository, passwordEncoder,
                    staffDef.host().dni(), staffDef.host().firstName(), staffDef.host().lastName(),
                    staffDef.host().phone(), staffDef.host().email(), hostRole, branch,
                    staffDef.host().username(), staffDef.host().rawPassword()
            );

            // Kitchen
            findOrCreateUserWithCredentials(
                    userRepository, credentialsRepository, passwordEncoder,
                    staffDef.kitchen().dni(), staffDef.kitchen().firstName(), staffDef.kitchen().lastName(),
                    staffDef.kitchen().phone(), staffDef.kitchen().email(), kitchenRole, branch,
                    staffDef.kitchen().username(), staffDef.kitchen().rawPassword()
            );
        }

        System.out.println("Empleados y credenciales sincronizados para todas las sucursales.");
        return branchWaiters;
    }

    private UserEntity findOrCreateUserWithCredentials(
            UserRepository userRepository,
            CredentialsRepository credentialsRepository,
            PasswordEncoder passwordEncoder,
            Long dni, String firstName, String lastName, String phone, String email,
            RoleEntity role, BranchEntity branch, String username, String rawPassword) {

        UserEntity user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByDni(dni))
                .orElseGet(() -> userRepository.save(
                        UserEntity.builder()
                                .dni(dni)
                                .firstName(firstName)
                                .lastName(lastName)
                                .phoneNumber(phone)
                                .email(email)
                                .role(role)
                                .branch(branch)
                                .build()
                ));

        // Asegurar que si el usuario ya existía pero no tenía branch o rol, se actualicen
        boolean updated = false;
        if (user.getRole() == null && role != null) {
            user.setRole(role);
            updated = true;
        }
        if (user.getBranch() == null && branch != null) {
            user.setBranch(branch);
            updated = true;
        }
        if (updated) {
            user = userRepository.save(user);
        }

        boolean userHasCreds = credentialsRepository.findByUser_Id(user.getId()).isPresent();
        if (!userHasCreds && !credentialsRepository.existsByUsername(username)) {
            CredentialsEntity credentials = CredentialsEntity.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPassword))
                    .enabled(Boolean.TRUE)
                    .user(user)
                    .roles(Set.of(role))
                    .build();
            credentialsRepository.save(credentials);
        }

        return user;
    }

    private record UserSpec(Long dni, String firstName, String lastName, String phone, String email, String username, String rawPassword) {}
    private record BranchStaffDefinition(int branchIndex, UserSpec manager, List<UserSpec> waiters, UserSpec host, UserSpec kitchen) {}

    // =========================================================================
    // 7. MESAS POR SUCURSAL
    // =========================================================================
    private Map<Long, List<TableEntity>> loadTables(
            List<BranchEntity> branches,
            Map<Long, List<UserEntity>> branchWaiters,
            TableRepository tableRepository) {

        Map<Long, List<TableEntity>> branchTables = new HashMap<>();

        // Definición de distribución espacial de 10 mesas
        List<TableLayoutSpec> layoutSpecs = List.of(
                new TableLayoutSpec(1, 2, "ROUND", 60, 80),
                new TableLayoutSpec(2, 4, "SQUARE", 230, 80),
                new TableLayoutSpec(3, 6, "RECTANGULAR", 410, 80),
                new TableLayoutSpec(4, 4, "ROUND", 600, 80),
                new TableLayoutSpec(5, 4, "SQUARE", 60, 240),
                new TableLayoutSpec(6, 2, "ROUND", 230, 240),
                new TableLayoutSpec(7, 6, "RECTANGULAR", 410, 240),
                new TableLayoutSpec(8, 8, "RECTANGULAR", 600, 240),
                new TableLayoutSpec(9, 4, "ROUND", 140, 400),
                new TableLayoutSpec(10, 4, "SQUARE", 380, 400)
        );

        for (BranchEntity branch : branches) {
            List<UserEntity> waiters = branchWaiters.getOrDefault(branch.getId(), List.of());
            List<TableEntity> tables = new ArrayList<>();

            for (TableLayoutSpec spec : layoutSpecs) {
                // Asignación de estado inicial:
                // Mesas 1 a 4 están ocupadas con mozos asignados y órdenes activas
                // Mesas 5 a 10 están libres
                boolean isOccupied = spec.number() <= 4;
                UserEntity assignedWaiter = null;
                if (isOccupied && !waiters.isEmpty()) {
                    assignedWaiter = waiters.get((spec.number() - 1) % waiters.size());
                }

                final UserEntity finalWaiter = assignedWaiter;
                final boolean finalAvailable = !isOccupied;

                TableEntity table = tableRepository.findByBranch_IdAndNumber(branch.getId(), spec.number())
                        .orElseGet(() -> tableRepository.save(
                                TableEntity.builder()
                                        .branch(branch)
                                        .number(spec.number())
                                        .capacity(spec.capacity())
                                        .shape(spec.shape())
                                        .posX(spec.posX())
                                        .posY(spec.posY())
                                        .available(finalAvailable)
                                        .waiter(finalWaiter)
                                        .build()
                        ));

                // Si ya existía, sincronizamos para asegurar estado ocupado/libre consistente
                boolean needSave = false;
                if (table.getActive() == null) {
                    table.setActive(true);
                    needSave = true;
                }
                if (table.getShape() == null || !table.getShape().equalsIgnoreCase(spec.shape())) {
                    table.setShape(spec.shape());
                    table.setPosX(spec.posX());
                    table.setPosY(spec.posY());
                    table.setCapacity(spec.capacity());
                    needSave = true;
                }
                if (Boolean.TRUE.equals(table.getActive()) && isOccupied && (table.getWaiter() == null || table.getAvailable()) && finalWaiter != null) {
                    table.setWaiter(finalWaiter);
                    table.setAvailable(false);
                    needSave = true;
                }
                if (needSave) {
                    table = tableRepository.save(table);
                }

                tables.add(table);
            }
            branchTables.put(branch.getId(), tables);
        }

        System.out.println("Mesas configuradas para todas las sucursales.");
        return branchTables;
    }

    private record TableLayoutSpec(int number, int capacity, String shape, int posX, int posY) {}

    // =========================================================================
    // 8. PEDIDOS, DETALLES Y PAGOS
    // =========================================================================
    private void loadOrders(
            List<BranchEntity> branches,
            Map<Long, List<TableEntity>> branchTables,
            Map<Long, List<UserEntity>> branchWaiters,
            Map<String, ProductEntity> catalog,
            Map<String, OrderStatusEntity> orderStatuses,
            List<PaymentMethodEntity> paymentMethods,
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository,
            OrderPaymentRepository orderPaymentRepository) {

        Random random = new Random(42); // Semilla fija para reproducibilidad

        for (BranchEntity branch : branches) {
            List<TableEntity> tables = branchTables.get(branch.getId());
            List<UserEntity> waiters = branchWaiters.get(branch.getId());
            if (tables == null || tables.isEmpty() || waiters == null || waiters.isEmpty()) {
                continue;
            }

            List<ProductEntity> allProducts = new ArrayList<>(catalog.values());

            // -------------------------------------------------------------
            // A) ÓRDENES ACTIVAS EN TIEMPO REAL (Mesas 1 a 4)
            // -------------------------------------------------------------
            boolean hasActiveOrders = orderRepository.findAll().stream()
                    .anyMatch(o -> o.getBranch().getId().equals(branch.getId())
                            && !"PAID".equalsIgnoreCase(o.getStatus().getName())
                            && !"CANCELLED".equalsIgnoreCase(o.getStatus().getName()));

            if (!hasActiveOrders) {
                createActiveOrder(
                        branch, tables.get(0), waiters.get(0 % waiters.size()), orderStatuses.get("PREPARING"),
                        22, List.of(
                                new ItemDraft("Hamburguesa Doble Cibus", 2, "Una sin cebolla por favor."),
                                new ItemDraft("Papas Bravas Cibus", 1, "Salsa brava aparte."),
                                new ItemDraft("Cerveza Artesanal IPA", 2, null)
                        ), catalog, orderRepository, orderDetailRepository);

                createActiveOrder(
                        branch, tables.get(1), waiters.get(1 % waiters.size()), orderStatuses.get("READY"),
                        35, List.of(
                                new ItemDraft("Bife de Chorizo Angus (400g)", 1, "Punto jugoso."),
                                new ItemDraft("Salmón Rosado a la Plancha", 1, "Bien caliente."),
                                new ItemDraft("Vino Malbec Copa", 2, null),
                                new ItemDraft("Agua Mineral 500ml", 1, "Sin gas.")
                        ), catalog, orderRepository, orderDetailRepository);

                createActiveOrder(
                        branch, tables.get(2), waiters.get(2 % waiters.size()), orderStatuses.get("SERVED"),
                        50, List.of(
                                new ItemDraft("Ravioles de Espinaca y Ricota", 2, "Con abundante queso."),
                                new ItemDraft("Sorrentinos de Jamón y Queso", 1, null),
                                new ItemDraft("Limonada con Menta y Jengibre", 1, null),
                                new ItemDraft("Tiramisú Tradicional", 2, "Servir luego del plato principal.")
                        ), catalog, orderRepository, orderDetailRepository);

                createActiveOrder(
                        branch, tables.get(3), waiters.get(3 % waiters.size()), orderStatuses.get("PENDING"),
                        10, List.of(
                                new ItemDraft("Provoleta Especial Cibus", 1, "Bien dorada."),
                                new ItemDraft("Empanadas de Carne Criolla", 4, "Fritas."),
                                new ItemDraft("Fernet Branca con Cola", 2, "Hielo abundante.")
                        ), catalog, orderRepository, orderDetailRepository);
            }

            // -------------------------------------------------------------
            // B) ÓRDENES HISTÓRICAS (ÚLTIMOS 30 DÍAS: PAID y CANCELLED)
            // -------------------------------------------------------------
            long branchOrderCount = orderRepository.findAll().stream()
                    .filter(o -> o.getBranch().getId().equals(branch.getId()))
                    .count();

            int ordersToCreate = (branchOrderCount < 25) ? (int) (25 - branchOrderCount) : 0;
            OrderStatusEntity paidStatus = orderStatuses.get("PAID");
            OrderStatusEntity cancelledStatus = orderStatuses.get("CANCELLED");

            for (int i = 1; i <= ordersToCreate; i++) {
                TableEntity mesa = tables.get(random.nextInt(tables.size()));
                UserEntity mozo = waiters.get(random.nextInt(waiters.size()));
                OrderStatusEntity status = (i % 8 == 0) ? cancelledStatus : paidStatus;

                int daysAgo = random.nextInt(28) + 1;
                int hour = (random.nextBoolean()) ? (12 + random.nextInt(4)) : (20 + random.nextInt(4));
                LocalDateTime createdAt = LocalDateTime.now()
                        .minusDays(daysAgo)
                        .withHour(hour)
                        .withMinute(random.nextInt(60))
                        .withSecond(0)
                        .withNano(0);

                int serviceDuration = 40 + random.nextInt(50);
                LocalDateTime closedAt = createdAt.plusMinutes(serviceDuration);

                int itemCount = 2 + random.nextInt(3);
                List<OrderDetailEntity> details = new ArrayList<>();
                BigDecimal subtotal = BigDecimal.ZERO;

                Map<String, BigDecimal> standardPrices = getStandardPrices();

                for (int j = 0; j < itemCount; j++) {
                    ProductEntity prod = allProducts.get(random.nextInt(allProducts.size()));
                    int qty = 1 + random.nextInt(2);
                    BigDecimal unitPrice = standardPrices.getOrDefault(prod.getName(), BigDecimal.valueOf(3500));
                    BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
                    subtotal = subtotal.add(lineTotal);

                    details.add(OrderDetailEntity.builder()
                            .product(prod)
                            .quantity(qty)
                            .unitPrice(unitPrice)
                            .observation((j == 0 && i % 3 == 0) ? "Para compartir." : null)
                            .build());
                }

                BigDecimal discount = (i % 4 == 0) ? BigDecimal.valueOf(1000) : BigDecimal.ZERO;
                BigDecimal finalTotal = subtotal.subtract(discount).max(BigDecimal.ZERO);

                OrderEntity order = OrderEntity.builder()
                        .branch(branch)
                        .table(mesa)
                        .waiter(mozo)
                        .status(status)
                        .subtotal(subtotal)
                        .discount(discount)
                        .finalTotal(finalTotal)
                        .createdAt(createdAt)
                        .closedAt(closedAt)
                        .build();

                OrderEntity savedOrder = orderRepository.save(order);
                for (OrderDetailEntity det : details) {
                    det.setOrder(savedOrder);
                }
                orderDetailRepository.saveAll(details);

                // Si fue pagada, registramos el pago correspondiente
                if ("PAID".equalsIgnoreCase(status.getName()) && !paymentMethods.isEmpty()) {
                    PaymentMethodEntity method = paymentMethods.get(random.nextInt(paymentMethods.size()));
                    orderPaymentRepository.save(OrderPaymentEntity.builder()
                            .order(savedOrder)
                            .paymentMethod(method)
                            .amount(finalTotal)
                            .build());
                }
            }

            System.out.println("Órdenes y detalles generados para " + branch.getName());
        }
    }

    private void createActiveOrder(
            BranchEntity branch,
            TableEntity table,
            UserEntity waiter,
            OrderStatusEntity status,
            int minutesAgo,
            List<ItemDraft> items,
            Map<String, ProductEntity> catalog,
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository) {

        Map<String, BigDecimal> standardPrices = getStandardPrices();
        LocalDateTime createdAt = LocalDateTime.now().minusMinutes(minutesAgo);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderDetailEntity> details = new ArrayList<>();

        for (ItemDraft draft : items) {
            ProductEntity prod = catalog.get(draft.productName());
            if (prod == null) continue;

            BigDecimal unitPrice = standardPrices.getOrDefault(prod.getName(), BigDecimal.valueOf(4000));
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(draft.quantity())));

            details.add(OrderDetailEntity.builder()
                    .product(prod)
                    .quantity(draft.quantity())
                    .unitPrice(unitPrice)
                    .observation(draft.observation())
                    .build());
        }

        OrderEntity activeOrder = OrderEntity.builder()
                .branch(branch)
                .table(table)
                .waiter(waiter)
                .status(status)
                .subtotal(subtotal)
                .discount(BigDecimal.ZERO)
                .finalTotal(subtotal)
                .createdAt(createdAt)
                .closedAt(null)
                .build();

        OrderEntity saved = orderRepository.save(activeOrder);
        for (OrderDetailEntity det : details) {
            det.setOrder(saved);
        }
        orderDetailRepository.saveAll(details);
    }

    private record ItemDraft(String productName, int quantity, String observation) {}
}
