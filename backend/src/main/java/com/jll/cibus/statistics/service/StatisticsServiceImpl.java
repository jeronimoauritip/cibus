package com.jll.cibus.statistics.service;

import com.jll.cibus.auth.AuthService;
import com.jll.cibus.common.exception.*;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.orderdetail.repository.OrderDetailRepository;
import com.jll.cibus.role.enums.Roles;
import com.jll.cibus.statistics.dto.order.OrderInsightDTO;
import com.jll.cibus.statistics.dto.order.OrderMetricDTO;
import com.jll.cibus.statistics.dto.overview.OverviewInsightDTO;
import com.jll.cibus.statistics.dto.product.ProductCategoryMetricDTO;
import com.jll.cibus.statistics.dto.product.ProductInsightDTO;
import com.jll.cibus.statistics.dto.product.ProductMetricDTO;
import com.jll.cibus.statistics.dto.table.TableInsightDTO;
import com.jll.cibus.statistics.dto.table.TableMetricDTO;
import com.jll.cibus.statistics.dto.waiter.WaiterInsightDTO;
import com.jll.cibus.statistics.dto.waiter.WaiterMetricDTO;
import com.jll.cibus.table.repository.TableRepository;
import com.jll.cibus.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl  implements  StatisticsService {

    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserRepository userRepository;
    private final AuthService authService;


    /* Metodo que valida la coherencia de las fechas de inicio y fin.
     En el hipotético caso que se llegase a dar que existe fecha de fin, pero no fecha de inicio,
     en vez de devolver todos los registros históricos (muy caro en cuanto a consumo de recursos),
     se devolverían únicamente los registros de un año de antigüedad partiendo desde la fecha final.
     */
    private Map<String, LocalDateTime> dateValidator(LocalDateTime start, LocalDateTime end) {

        LocalDateTime resolvedEnd = end;
        if (end == null) resolvedEnd = LocalDateTime.now();

        LocalDateTime resolvedStart = start;
        if (start == null) resolvedStart = resolvedEnd.minusYears(1);

        if (resolvedStart.isAfter(resolvedEnd)) {
            throw new BusinessException("The start date cannot be after the end date");
        }
        return Map.of("resolvedEnd", resolvedEnd,
                "resolvedStart", resolvedStart);
    }

    @Override
    public TableInsightDTO getTableInsights(Long branchId, LocalDateTime start, LocalDateTime end) {

        // Validamos rol de usuario, existencia de sucursal y coherencia del request.
        authService.authenticateUserBelongsInBranch(branchId);

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        //  Mesa más concurrida en el rango de tiempo solicitado.
        TableMetricDTO mostBusy =
                orderRepository.findMostBusyTable(branchId, start, end)
                        .stream()
                        .findFirst()
                        .orElse(null);

        // Mesa menos concurrida en el rango de tiempo solicitado.
        TableMetricDTO lessBusy =
                orderRepository.findLessBusyTable(branchId, start, end)
                        .stream()
                        .findFirst()
                        .orElse(null);

        // Calculo de porcentaje de ocupación en el rango de tiempo solicitado.
        Long occupiedTables =
                orderRepository.countOccupiedTables(branchId, start, end);

        Long totalTables =
                tableRepository.countByBranchId(branchId);

        Double occupancyRate =
                totalTables == 0 ? 0.0 : occupiedTables.doubleValue() * 100 / totalTables;

        return TableInsightDTO.builder() // Construimos el DTO y lo devolvemos mediante patron Builder.
                .mostBusyTable(mostBusy)
                .lessBusyTable(lessBusy)
                .occupancyRate(occupancyRate)
                .build();
    }

    @Override
    public ProductInsightDTO getProductInsights(Long branchId, LocalDateTime start, LocalDateTime end) {

        // Validamos rol de usuario, existencia de sucursal y coherencia del request.
        authService.authenticateUserBelongsInBranch(branchId);

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Producto más vendido.
        ProductMetricDTO mostPopularProduct = orderDetailRepository.findMostPopularProducts(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Producto menos vendido.
        ProductMetricDTO lessPopularProduct = orderDetailRepository.findLessPopularProducts(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Producto mas caro.
        ProductMetricDTO mostExpensiveProduct = orderDetailRepository.findMostExpensiveProducts(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Producto más barato.
        ProductMetricDTO cheapestProduct = orderDetailRepository.findCheapestProducts(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Categoria mas vendida
        ProductCategoryMetricDTO mostPopularCategory = orderDetailRepository.findMostPopularCategories(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Categoria menos vendida
        ProductCategoryMetricDTO lessPopularCategory = orderDetailRepository.findLessPopularCategories(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        return ProductInsightDTO.builder() // Construimos el DTO y lo devolvemos mediante patron Builder.
                .mostPopularProduct(mostPopularProduct)
                .lessPopularProduct(lessPopularProduct)
                .mostExpensiveProduct(mostExpensiveProduct)
                .cheapestProduct(cheapestProduct)
                .mostPopularCategory(mostPopularCategory)
                .lessPopularCategory(lessPopularCategory)
                .build();
    }

    @Override
    public ProductInsightDTO getGlobalProductInsights(LocalDateTime start, LocalDateTime end) {

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Producto global más vendido.
        ProductMetricDTO GlobalMostPopularProduct = orderDetailRepository.findGlobalMostPopularProducts(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Producto global menos vendido.
        ProductMetricDTO GlobalLessPopularProduct = orderDetailRepository.findGlobalLessPopularProducts(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Producto global mas caro.
        ProductMetricDTO GlobalMostExpensiveProduct = orderDetailRepository.findGlobalMostExpensiveProducts(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Producto global más barato.
        ProductMetricDTO GlobalCheapestProduct = orderDetailRepository.findGlobalCheapestProducts(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Categoria global mas vendida
        ProductCategoryMetricDTO GlobalMostPopularCategory = orderDetailRepository.findGlobalMostPopularCategories(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Categoria menos vendida
        ProductCategoryMetricDTO GlobalLessPopularCategory = orderDetailRepository.findGlobalLessPopularCategories(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        return ProductInsightDTO.builder() // Construimos el DTO y lo devolvemos mediante patron Builder.
                .mostPopularProduct(GlobalMostPopularProduct)
                .lessPopularProduct(GlobalLessPopularProduct)
                .mostExpensiveProduct(GlobalMostExpensiveProduct)
                .cheapestProduct(GlobalCheapestProduct)
                .mostPopularCategory(GlobalMostPopularCategory)
                .lessPopularCategory(GlobalLessPopularCategory)
                .build();

    }

    @Override
    public OrderInsightDTO getOrderInsights(Long branchId, LocalDateTime start, LocalDateTime end) {

        // Validamos rol de usuario, existencia de sucursal y coherencia del request.
        authService.authenticateUserBelongsInBranch(branchId);

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Ganancia total.
        BigDecimal totalRevenue = orderRepository.getTotalRevenue(branchId, start, end);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO; // evitamos NullPointerException si no encuentra registros

        // Valor final promedio de las órdenes.
        Long totalOrders = orderRepository.getTotalOrdersBetweenTime(branchId, start, end); // traemos el total de órdenes en el rango de tiempo.
        BigDecimal averageTicket = totalOrders == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(
                BigDecimal.valueOf(totalOrders),
                2,
                RoundingMode.HALF_UP
        ); // Reutilizamos la ganancia total para calcular el average.

        // Promedio de ganancia por dia.
        long days = Math.max(1,ChronoUnit.DAYS.between(start, end)); // conseguimos la cantidad de dias que se busca
        BigDecimal averageRevenuePerDay = totalRevenue.divide(new BigDecimal(days), 2, RoundingMode.HALF_UP); // Reutilizamos la ganancia total para calcular el average.

        // Orden de mayor monto.
        OrderMetricDTO highestValueOrder = orderRepository.getMostValuatedOrders(branchId, start, end).stream()
                .findFirst()
                .orElse(null);

        // Orden de mayor monto.
        OrderMetricDTO lowestValueOrder = orderRepository.getLeastValuatedOrders(branchId, start, end).stream()
                .findFirst()
                .orElse(null);


        return OrderInsightDTO.builder() // Devolvemos la insight construida mediante patron Builder.
                .totalRevenue(totalRevenue)
                .averageTicket(averageTicket)
                .averageRevenuePerDay(averageRevenuePerDay)
                .highestValueOrder(highestValueOrder)
                .lowestValueOrder(lowestValueOrder)
                .totalOrders(totalOrders)
                .build();
    }

    @Override
    public OrderInsightDTO getGlobalOrderInsights(LocalDateTime start, LocalDateTime end) {

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Ganancia total.
        BigDecimal totalRevenue = orderRepository.getGlobalTotalRevenue(start, end);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO; // evitamos NullPointerException si no encuentra registros

        // Valor final promedio de las órdenes.
        Long totalOrders = orderRepository.getGlobalTotalOrdersBetweenTime(start, end); // traemos el total de órdenes en el rango de tiempo.
        BigDecimal averageTicket = totalOrders == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(
                BigDecimal.valueOf(totalOrders),
                2,
                RoundingMode.HALF_UP
        ); // Reutilizamos la ganancia total para calcular el average.

        // Promedio de ganancia por dia.
        long days = Math.max(1, ChronoUnit.DAYS.between(start, end));// conseguimos la cantidad de dias que se busca
        BigDecimal averageRevenuePerDay = totalRevenue.divide(new BigDecimal(days), 2, RoundingMode.HALF_UP); // Reutilizamos la ganancia total para calcular el average.

        // Orden de mayor monto.
        OrderMetricDTO highestValueOrder = orderRepository.getGlobalMostValuatedOrders(start, end).stream()
                .findFirst()
                .orElse(null);

        // Orden de mayor monto.
        OrderMetricDTO lowestValueOrder = orderRepository.getGlobalLeastValuatedOrders(start, end).stream()
                .findFirst()
                .orElse(null);


        return OrderInsightDTO.builder() // Devolvemos la insight construida mediante patron Builder.
                .totalRevenue(totalRevenue)
                .averageTicket(averageTicket)
                .averageRevenuePerDay(averageRevenuePerDay)
                .highestValueOrder(highestValueOrder)
                .lowestValueOrder(lowestValueOrder)
                .totalOrders(totalOrders)
                .build();
    }

    @Override
    public WaiterInsightDTO getWaiterInsights(Long branchId, LocalDateTime start, LocalDateTime end) {

        // Validamos rol de usuario, existencia de sucursal y coherencia del request.
        authService.authenticateUserBelongsInBranch(branchId);

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Ranking de facturacion de mozos ordenados de mayor a menor.
        List<WaiterMetricDTO> facturationRanking = orderRepository.getWaiterFacturationRanking(branchId, start, end);

        // Ranking de mesas atendidas por mozo ordenádos de mayor a menor.
        List<WaiterMetricDTO> ordersQuantityRanking = orderRepository.getOrdersQuantityRanking(branchId, start, end);

        // Promedio de órdenes por mozo
        Long totalWaiters = userRepository.countByUserRoleAndBranchId(Roles.WAITER, branchId);
        Long totalOrders = orderRepository.getTotalOrdersBetweenTime(branchId, start, end);
        Double averageOrdersPerWaiter = totalWaiters == 0 ? 0.0 : totalOrders.doubleValue() / totalWaiters;

        return WaiterInsightDTO.builder() // Devolvemos el insight mediante el patron Builder.
                .facturationRanking(facturationRanking)
                .ordersQuantityRanking(ordersQuantityRanking)
                .averageOrdersPerWaiter(averageOrdersPerWaiter)
                .build();
    }

    @Override
    public WaiterInsightDTO getGlobalWaiterInsights(LocalDateTime start, LocalDateTime end) {

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Ranking de facturacion de mozos ordenados de mayor a menor.
        List<WaiterMetricDTO> facturationRanking = orderRepository.getGlobalWaiterFacturationRanking(start, end);

        // Ranking de mesas atendidas por mozo ordenádos de mayor a menor.
        List<WaiterMetricDTO> ordersQuantityRanking = orderRepository.getGlobalOrdersQuantityRanking(start, end);

        // Promedio de órdenes por mozo
        Long totalWaiters = userRepository.countByUserRole(Roles.WAITER);
        Long totalOrders = orderRepository.getGlobalTotalOrdersBetweenTime(start, end);
        Double averageOrdersPerWaiter = totalWaiters == 0 ? 0.0 : totalOrders.doubleValue() / totalWaiters;

        return WaiterInsightDTO.builder() // Devolvemos el insight mediante el patron Builder.
                .facturationRanking(facturationRanking)
                .ordersQuantityRanking(ordersQuantityRanking)
                .averageOrdersPerWaiter(averageOrdersPerWaiter)
                .build();
    }

    @Override
    public OverviewInsightDTO getOverviewInsights(Long branchId, LocalDateTime start, LocalDateTime end) {

        // Validamos rol de usuario, existencia de sucursal y coherencia del request.
        authService.authenticateUserBelongsInBranch(branchId);

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Total facturacion
        BigDecimal totalRevenue = orderRepository.getTotalRevenue(branchId, start, end);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        // Total ordenes
        Long totalOrders = orderRepository.getTotalOrdersBetweenTime(branchId, start, end);

        // Calculo de porcentaje de ocupacion
        Long occupiedTables = orderRepository.countOccupiedTables(branchId, start, end);
        Long totalTables = tableRepository.countByBranchId(branchId);
        Double occupancyRate = totalTables == 0 ? 0.0 : occupiedTables.doubleValue() * 100 / totalTables;

        ProductMetricDTO mostPopularProduct = orderDetailRepository.findMostPopularProducts(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Categoria mas vendida
        ProductCategoryMetricDTO mostPopularCategory = orderDetailRepository.findMostPopularCategories(branchId, start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Mozo con mayor facturacion.
        WaiterMetricDTO bestWaiter = orderRepository.getWaiterFacturationRanking(branchId, start, end)
                .stream()
                .findFirst()
                .orElse(null);

        return OverviewInsightDTO
                .builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .occupancyRate(occupancyRate)
                .mostPopularProduct(mostPopularProduct)
                .mostPopularCategory(mostPopularCategory)
                .bestWaiter(bestWaiter)
                .build();
    }

    @Override
    public OverviewInsightDTO getGlobalOverviewInsights(LocalDateTime start, LocalDateTime end) {

        // Validamos coherencia de fechas
        Map<String, LocalDateTime> dates = dateValidator(start, end);
        start = dates.get("resolvedStart");
        end = dates.get("resolvedEnd");

        // Total facturacion
        BigDecimal totalRevenue = orderRepository.getGlobalTotalRevenue(start, end);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        // Total ordenes
        Long totalOrders = orderRepository.getGlobalTotalOrdersBetweenTime(start, end);

        // Porcentaje de ocupacion
        Long occupiedTables = orderRepository.countGlobalOccupiedTables(start, end);
        long totalTables = tableRepository.count();
        Double occupancyRate = totalTables == 0 ? 0.0 : occupiedTables.doubleValue() * 100 / totalTables;

        ProductMetricDTO mostPopularProduct = orderDetailRepository.findGlobalMostPopularProducts(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Categoria mas vendida
        ProductCategoryMetricDTO mostPopularCategory = orderDetailRepository.findGlobalMostPopularCategories(start, end)
                .stream()
                .findFirst()    // sacamos solo el primero.
                .orElse(null);

        // Mozo con mayor facturacion.
        WaiterMetricDTO bestWaiter = orderRepository.getGlobalWaiterFacturationRanking(start, end)
                .stream()
                .findFirst()
                .orElse(null);

        return OverviewInsightDTO
                .builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .occupancyRate(occupancyRate)
                .mostPopularProduct(mostPopularProduct)
                .mostPopularCategory(mostPopularCategory)
                .bestWaiter(bestWaiter)
                .build();
    }
}
