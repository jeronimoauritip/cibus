# Cibus - Sistema de Gestión Gastronómica Multisucursal

![Header](backend/src/main/java/com/jll/cibus/common/assets/CIBUS%20Header.png)
![Java](https://img.shields.io/badge/Java-25-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen?logo=spring-boot)
![Angular](https://img.shields.io/badge/Angular-22-dd0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.x-blue?logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=json-web-tokens)
![OpenAPI](https://img.shields.io/badge/OpenAPI-Swagger-lightgreen?logo=openapi)

## Descripción del Proyecto

**Cibus** es un sistema de gestión integral para entidades gastronómicas diseñado para operar con una o múltiples sucursales de forma centralizada y autónoma. El sistema optimiza los procesos operativos diarios del restaurante, conectando dinámicamente los roles esenciales (administrador, encargado, mozo, cocinero y recepcionista) para reducir errores humanos en la toma de pedidos, agilizar los flujos de trabajo en tiempo real y proveer estadísticas analíticas de rendimiento comercial.

El repositorio está organizado como un **monorepo** que integra tanto el **Backend** (arquitectura **API REST** modular, documentada bajo estándares OpenAPI y protegida mediante tokens JWT sin estado) como el **Frontend** (aplicación web reactiva SPA desarrollada en **Angular** con soporte para mapa interactivo de salón, comandas de cocina en tiempo real, acceso rápido por PIN y paneles estadísticos).

---

## Estructura del Monorepo

```text
cibus/
├── backend/       # API REST en Java 25 + Spring Boot + MySQL + Spring Security (JWT)
└── frontend/      # Aplicación SPA en Angular + TypeScript + GSAP + RxJS
```

---

## Tecnologías y Herramientas

### Backend (`/backend`)
El backend de la aplicación ha sido desarrollado utilizando un stack tecnológico moderno de alta fidelidad:

- **Lenguaje principal:** Java 25
- **Framework base:** Spring Boot 4
- **Capa de persistencia:** Spring Data JPA con Hibernate
- **Motor de Base de Datos:** MySQL
- **Seguridad y Autorización:** Spring Security + JSON Web Tokens (JWT)
- **Mapeo de Objetos:** ModelMapper & Lombok
- **Documentación de API:** Swagger / OpenAPI (`springdoc-openapi`)
- **Gestión de dependencias:** Maven

### Frontend (`/frontend`)
El cliente web proporciona una interfaz moderna, fluida y adaptada a la operatoria gastronómica en salón, cocina y administración:

- **Framework principal:** Angular 22 (Arquitectura de componentes Standalone y Signals)
- **Lenguaje:** TypeScript 6.0
- **Programación Reactiva:** RxJS 7.8
- **Animaciones e Interacciones UI:** GSAP (GreenSock Animation Platform)
- **Seguridad en Cliente:** Guards de autenticación y autorización por roles (`authGuard`, `roleGuard`) e interceptores HTTP con soporte para *Refresh Token*
- **Testing:** Vitest + JSDOM
- **Gestión de paquetes:** npm

---

## Roles del Sistema y Requisitos Funcionales (RF)

El sistema implementa un control de acceso basado en jerarquía de roles:

### 1. Administrador (Admin)
- **RF01:** Ingreso al sistema mediante usuario y clave personal.
- **RF02 / RF03:** Consulta de listados y Gestión Completa (ABM) de sucursales.
- **RF04 / RF05:** Consulta de listados y Gestión Completa (ABM) de empleados globales.
- **RF06 / RF07:** Consulta de listados y Gestión Completa (ABM) de los productos del menú global.
- **RF08:** Visualización avanzada de estadísticas consolidadas de todas las sucursales y de cada sucursal específica.

### 2. Encargado de Sucursal (Manager)
- **RF09:** Ingreso mediante ID de sucursal específica y clave personal de usuario.
- **RF10 / RF11:** Consulta y Gestión Completa (ABM) de las mesas de su sucursal asignada.
- **RF12 / RF13:** Consulta y modificación de los productos del menú de su sucursal asignada.
- **RF14 / RF15:** Consulta y modificación de la información de los empleados de su sucursal.
- **RF16:** Acceso a las estadísticas y métricas analíticas de su sucursal asignada.

### 3. Cocinero (Chef)
- **RF17:** Ingreso mediante ID de sucursal y pin personal interno.
- **RF18:** Consulta en tiempo real del listado de pedidos entrantes.
- **RF19:** Modificación del estado del pedido (por ejemplo: de 'En preparación' a 'Listo').

### 4. Mozo (Waiter)
- **RF20:** Ingreso mediante ID de sucursal y pin personal interno.
- **RF21:** Visualización del listado de mesas de su sucursal asignada.
- **RF22:** Apertura de nuevos pedidos vinculados a una mesa específica asignada al mozo.
- **RF23:** Navegación por el menú de productos disponibles en la sucursal asignada y selección de los mismos para el pedido activo.
- **RF24:** Modificación o edición de un pedido existente en una mesa asociada al mozo.

### 5. Recepcionista (Host)
- **RF25:** Ingreso mediante ID de sucursal y pin personal interno.
- **RF26:** Consulta general del mapa/listado de mesas de la sucursal.
- **RF27:** Modificación del estado de ocupación de una mesa existente.
- **RF28:** Asignación dinámica de un mozo a una mesa libre específica.
- **RF29:** Apertura de nuevos pedidos vinculados a una mesa específica autoasignada.
- **RF30:** Navegación por el menú de productos disponibles en la sucursal asignada y selección de los mismos para el pedido activo.
- **RF31:** Modificación o edición de un pedido existente en una mesa autoasignada.

---

## Módulos y Vistas Principales del Frontend

La aplicación Angular articula las operaciones de cada rol en vistas especializadas:

- **Selección de Sucursal e Ingreso Dual (`/`, `/login`):** Teclado numérico interactivo para ingreso rápido por **PIN de 4 dígitos** (personal operativo de salón y cocina) y acceso mediante credenciales de correo/contraseña para **Administración y Encargados**.
- **Mapa Interactivo de Mesas (`/tables`, `/branches/:branchId/tables`):** Lienzo visual 2D del salón con arrastrar y soltar (*drag & drop*), personalización de formas (`ROUND`, `SQUARE`, `RECTANGULAR`) y capacidades, indicadores en tiempo real del estado de cada mesa (*Libre*, *Ocupada*, *En cocina*, *Listo para servir*, *Servida*), asignación de mozos, visualización de tickets y cobro con múltiples medios de pago y descuentos.
- **Toma y Edición de Pedidos (`/tables/:tableNumber/order`):** Catálogo interactivo del menú de la sucursal filtrado por categorías, control de cantidades, notas/observaciones por plato para la cocina y resumen de comanda en vivo.
- **Monitor de Cocina - KDS (`/kitchen`):** Tablero para cocineros con visualización de comandas entrantes, detalle de ítems con observaciones y transición rápida de estados (`PENDING` -> `PREPARING` -> `READY`).
- **Panel de Administración y Gestión (`/admin/*`):**
  - **Sucursales (`/admin/branches`):** Alta, edición y consulta de sucursales y su personal asignado.
  - **Empleados (`/admin/employees`, `/users`):** Gestión integral de usuarios, asignación de roles/sucursales, blanqueo de PIN y cambio de contraseñas.
  - **Catálogo Global y Menú por Sucursal (`/admin/menu`, `/admin/menu/branch/:branchId`):** Administración del catálogo maestro de productos y configuración de precios y disponibilidad específicos por cada sucursal.
  - **Dashboard de Estadísticas (`/admin/statistics`):** Métricas analíticas globales y por sucursal con filtros por rango de fechas (facturación, pedidos, ranking de mozos, productos más vendidos y rotación de mesas).

---

## Requisitos No Funcionales (RNF)

- **RNF01 (Rendimiento):** El sistema debe responder a las solicitudes de los usuarios en un tiempo máximo de 3 segundos bajo condiciones normales de uso.
- **RNF02 (Escalabilidad Horizontal):** Capaz de gestionar múltiples sesiones simultáneas sin degradación perceptible del servicio.
- **RNF03 (Seguridad):** Autenticación mandatoria previa al acceso de cualquier recurso o funcionalidad.
- **RNF04 (Sesiones):** Gestión de sesiones mediante tokens JWT firmados digitalmente con un tiempo de expiración definido.
- **RNF05 (Autorización):** Restricción estricta de endpoints según el rol asignado al usuario autenticado.
- **RNF06 (Extensibilidad):** Soporte nativo para la incorporación de nuevas sucursales sin requerir cambios de código en la arquitectura base.
- **RNF07 (Estandarización):** API completamente documentada bajo la especificación OpenAPI.

---

## Catálogo de Endpoints de la API REST

Toda la interacción con el backend se realiza a través de las siguientes rutas estructuradas:

### Autenticación (Auth)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth` | Autenticar usuario (mediante usuario/clave o PIN) y obtener JWT |
| `POST` | `/api/auth/refresh` | Renovar el token de acceso mediante un *Refresh Token* válido |
| `GET` | `/api/auth` | Obtener la información del usuario actualmente autenticado |

### Sucursales (Branches)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/branches` | Obtener listado de todas las sucursales |
| `GET` | `/api/branches/{branchId}` | Obtener el detalle de una sucursal mediante su ID |
| `GET` | `/api/branches/search` | Buscar sucursal por dirección física (`street`, `number`) |
| `POST` | `/api/branches` | Registrar una nueva sucursal en el sistema |
| `PUT` | `/api/branches/{branchId}` | Modificar los datos de una sucursal por ID |
| `DELETE` | `/api/branches/{branchId}` | Eliminar una sucursal mediante su ID |

### Usuarios y Empleados (Users)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/users` | Obtener lista paginada de usuarios con soporte de filtros dinámicos |
| `GET` | `/api/users/{userId}` | Obtener un usuario específico mediante su ID |
| `POST` | `/api/users` | Crear/Registrar un nuevo usuario |
| `PUT` | `/api/users/{userId}` | Modificar los datos de un usuario por ID |
| `PUT` | `/api/users/{userId}/change-password` | Cambiar la contraseña de un usuario |
| `PATCH` | `/api/users/{userId}/reset-pin` | Restablecer o modificar el PIN de acceso de un empleado |
| `PUT` | `/api/users/{userId}/change-role` | Modificar el rol asignado a un usuario |
| `DELETE` | `/api/users/{userId}` | Eliminar un usuario del sistema por ID |
| `GET` | `/api/users/roles` | Obtener el catálogo de roles disponibles en el sistema |

### Productos Globales (Products)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Obtener productos con filtros dinámicos aplicados |
| `GET` | `/api/products/{productId}` | Obtener la información de un producto por ID |
| `POST` | `/api/products` | Agregar un nuevo producto al catálogo general |
| `PUT` | `/api/products/{productId}` | Modificar un producto existente por ID |
| `PUT` | `/api/products/{productId}/activate` | Reactivar un producto previamente dado de baja |
| `DELETE` | `/api/products/{productId}` | Eliminar/Desactivar un producto por ID |
| `GET` | `/api/products/categories` | Listar nombres de categorías globales de productos |

### Menú por Sucursal (Branch Products)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/branches/{branchId}/products` | Obtener el menú de productos de una sucursal con filtros (categoría, precio, disponibilidad) |
| `GET` | `/api/branches/{branchId}/products/{productId}` | Obtener el detalle de precio y disponibilidad de un producto en la sucursal |
| `POST` | `/api/branches/{branchId}/products` | Asociar un producto del catálogo al menú de una sucursal con su precio |
| `PUT` | `/api/branches/{branchId}/products/{productId}` | Actualizar el precio o la disponibilidad de un producto en la sucursal |
| `DELETE` | `/api/branches/{branchId}/products/{productId}` | Quitar un producto del menú de una sucursal |

### Mesas por Sucursal (Tables)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/branches/{branchId}/tables` | Obtener mesas de una sucursal con filtros dinámicos |
| `GET` | `/api/branches/{branchId}/tables/{tableNumber}` | Obtener una mesa específica por su número en la sucursal |
| `POST` | `/api/branches/{branchId}/tables` | Registrar una mesa en una sucursal determinada |
| `PUT` | `/api/branches/{branchId}/tables/{tableNumber}` | Modificar los atributos (capacidad, posición, forma, mozo) de una mesa |
| `DELETE` | `/api/branches/{branchId}/tables/{tableNumber}` | Eliminar una mesa mediante su número |
| `PATCH` | `/api/branches/{branchId}/tables/occupy/{tableNumber}` | Marcar el estado de una mesa como **Ocupada** y asignar mozo |
| `PATCH` | `/api/branches/{branchId}/tables/free/{tableNumber}` | Marcar el estado de una mesa como **Libre** |

### Pedidos (Orders)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/branches/{branchId}/orders` | Obtener pedidos de una sucursal con filtros dinámicos |
| `GET` | `/api/branches/{branchId}/orders/{orderId}` | Obtener detalles generales de un pedido por ID |
| `POST` | `/api/branches/{branchId}/orders` | Crear un nuevo pedido vinculado a una mesa |
| `PUT` | `/api/branches/{branchId}/orders/{orderId}` | Modificar la cabecera de un pedido por ID |
| `GET` | `/api/branches/{branchId}/orders/statuses` | Listar los estados válidos de un pedido |
| `POST` | `/api/branches/{branchId}/orders/{orderId}/payments` | Agregar un registro de pago asociado al pedido |
| `PATCH` | `/api/branches/{branchId}/orders/{orderId}/discount` | Aplicar un descuento monetario sobre el total |
| `POST` | `/api/branches/{branchId}/orders/{orderId}/pending` | Marcar la orden como **Pendiente** (`PENDING`) |
| `POST` | `/api/branches/{branchId}/orders/{orderId}/preparing` | Marcar la orden como **En preparación** (`PREPARING`) |
| `POST` | `/api/branches/{branchId}/orders/{orderId}/ready` | Marcar la orden como **Lista** (`READY` - Cocina finalizada) |
| `POST` | `/api/branches/{branchId}/orders/{orderId}/serve` | Marcar la orden como **Servida** (`SERVED`) por el mozo |
| `POST` | `/api/branches/{branchId}/orders/{orderId}/cancel` | Cancelar una orden de forma lógica (`CANCELLED`) por ID |

### Detalles del Pedido (Order Details)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/branches/{branchId}/orders/{orderId}/items` | Listar ítems de productos incluidos en un pedido |
| `GET` | `/api/branches/{branchId}/orders/{orderId}/items/{productId}` | Consultar detalle de un producto específico en la orden |
| `POST` | `/api/branches/{branchId}/orders/{orderId}/items` | Agregar una línea de producto al detalle de un pedido |
| `PUT` | `/api/branches/{branchId}/orders/{orderId}/items/{productId}` | Modificar la cantidad u observaciones de un ítem |
| `DELETE` | `/api/branches/{branchId}/orders/{orderId}/items/{productId}` | Eliminar un producto del detalle de un pedido |

### Categorías de Producto & Métodos de Pago
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/product-categories` | Obtener todas las categorías de producto |
| `GET` | `/api/product-categories/{productCategoryId}` | Obtener categoría por ID |
| `GET` | `/api/product-categories/name/{name}` | Buscar categoría por su nombre exacto |
| `POST` | `/api/product-categories` | Crear una nueva categoría de producto |
| `PUT` | `/api/product-categories/{productCategoryId}` | Modificar una categoría existente |
| `DELETE` | `/api/product-categories/{productCategoryId}` | Eliminar una categoría por ID |
| `GET` | `/api/payment-methods` | Obtener todos los métodos de pago habilitados |
| `GET` | `/api/payment-methods/{paymentMethodId}` | Obtener método de pago por ID |
| `GET` | `/api/payment-methods/name/{name}` | Buscar método de pago por nombre |
| `POST` | `/api/payment-methods` | Dar de alta un nuevo método de pago |
| `PUT` | `/api/payment-methods/{paymentMethodId}` | Modificar un método de pago por ID |
| `DELETE` | `/api/payment-methods/{paymentMethodId}` | Deshabilitar/Eliminar método de pago por ID |

### Estadísticas y Analíticas (Statistics)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/statistics/global/overview` | Resumen general consolidado de todas las sucursales |
| `GET` | `/api/statistics/branch/{branchId}/overview` | Resumen general de métricas de una sucursal |
| `GET` | `/api/statistics/branch/{branchId}/tables` | Métricas de uso y ocupación de mesas por sucursal |
| `GET` | `/api/statistics/global/products` | Estadísticas globales de productos más y menos vendidos |
| `GET` | `/api/statistics/branch/{branchId}/products` | Estadísticas de productos vendidos en una sucursal |
| `GET` | `/api/statistics/global/orders` | Métricas globales de pedidos y tickets de mayor/menor valor |
| `GET` | `/api/statistics/branch/{branchId}/orders` | Métricas de pedidos de una sucursal específica |
| `GET` | `/api/statistics/global/waiters` | Ranking global de mozos por facturación y cantidad de pedidos |
| `GET` | `/api/statistics/branch/{branchId}/waiters` | Ranking de desempeño de mozos de una sucursal |

---

## Configuración e Instalación

Esta sección describe los pasos necesarios para inicializar el entorno de desarrollo local tanto para el **Backend** como para el **Frontend** del **Proyecto Cibus**.

### Prerrequisitos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu máquina local:

* **Java Development Kit (JDK):** Versión 25 (o compatible con la configuración del `pom.xml`).
* **Apache Maven:** Versión 3.8 o superior (o utilizar el Maven Wrapper `mvnw` incluido en `/backend`).
* **MySQL Server:** Versión 8.0 o superior.
* **Node.js y npm:** Node.js LTS (v20/v22+) y npm (v10/v11+) para ejecutar el cliente Angular.
* **Un IDE compatible:** IntelliJ IDEA, Eclipse o VS Code con extensiones para Spring y Angular.

---

## Pasos para la Instalación

### 1. Clonar el repositorio

Descarga el código fuente del proyecto a tu máquina local mediante Git:

```bash
git clone https://github.com/Jenkow/cibus
cd cibus
```

### 2. Configurar la Base de Datos

Abre tu gestor de bases de datos MySQL (MySQL Workbench, phpMyAdmin, DBeaver, etc.) y crea la base de datos para el proyecto:

```sql
CREATE DATABASE cibus_db;
```

### 3. Configurar y Ejecutar el Backend (`/backend`)

Dirígete al directorio `backend` y revisa el archivo `backend/src/main/resources/application.yaml`. Asegúrate de definir las variables de entorno correspondientes (o ajustarlas según tu entorno local):

```yaml
spring:
  datasource:
    url: ${DB_URL}           # Ej: jdbc:mysql://localhost:3306/cibus_db
    username: ${DB_USER}     # Tu usuario de MySQL
    password: ${DB_PASS}     # Tu contraseña de MySQL
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION}
```

Compila e inicia el servidor backend utilizando el Maven Wrapper incluido:

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```
*(En Windows PowerShell puedes ejecutar `.\mvnw.cmd spring-boot:run`).*

- La API comenzará a correr por defecto en el puerto `8080` (`http://localhost:8080`).
- Al iniciar por primera vez, el `DataLoader` poblará automáticamente la base de datos con sucursales, categorías, productos, menús por sucursal, mesas, pedidos y empleados de prueba.
- **Documentación Swagger / OpenAPI:** Una vez que el servidor esté en ejecución, puedes explorar y probar todos los endpoints desde Swagger UI en: `http://localhost:8080/swagger-ui/index.html`.
- **Colección de Postman:** También puedes importar la plantilla de pruebas ubicada en `backend/src/main/resources/static/postman/cibus.postman_collection.json`.

### 4. Configurar y Ejecutar el Frontend (`/frontend`)

En una nueva terminal, sitúate en la carpeta `frontend` e instala las dependencias del proyecto con `npm`:

```bash
cd frontend
npm install
```

Inicia el servidor de desarrollo de Angular:

```bash
npm start
```

- El comando `npm start` ejecuta `ng serve --proxy-config proxy.conf.json`, levantando la aplicación en `http://localhost:4200` y redirigiendo automáticamente todas las peticiones `/api/*` hacia el backend en `http://localhost:8080`.
- Para compilar la aplicación para producción:
  ```bash
  npm run build
  ```
- Para ejecutar la suite de pruebas unitarias del frontend (Vitest):
  ```bash
  npm test
  ```

### Credenciales de Prueba Iniciales (DataLoader)

| Rol | Sucursal | Acceso (Usuario / PIN) | Contraseña / PIN |
| :--- | :--- | :--- | :--- |
| **Administrador** | Global | `admin@gmail.com` | `admin1234` |
| **Encargado** | Centro / Norte / Sur / Palermo | `manager@gmail.com` / `manager.norte@cibus.com` / `manager.sur@cibus.com` / `manager.palermo@cibus.com` | `1234` |
| **Mozo** | Centro / Norte / Sur / Palermo | PIN: `1111`..`1114` (Centro), `2111`..`2114` (Norte), `3111`..`3114` (Sur), `4111`..`4114` (Palermo) | Mismo PIN |
| **Recepcionista** | Centro / Norte / Sur / Palermo | PIN: `2222` (Centro), `2221` (Norte), `3221` (Sur), `4221` (Palermo) | Mismo PIN |
| **Cocinero** | Centro / Norte / Sur / Palermo | PIN: `3333` (Centro), `2331` (Norte), `3331` (Sur), `4331` (Palermo) | Mismo PIN |

---

# Equipo de Desarrollo
El diseño de sistemas, análisis de requisitos, modelado de base de datos e implementación del Proyecto Cibus fue llevado a cabo por el siguiente equipo técnico:
#### Auriti Primavera, Jerónimo — Desarrollador.
#### Oliver Cáceres, Luisina — Desarrolladora.
#### Sosa, Luciano — Desarrollador.   

### Cibus.
