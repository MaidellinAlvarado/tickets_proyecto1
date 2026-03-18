# 🎓 Proyecto 1: Plataforma de Gestión de Tickets (Soporte L1/L2)

**Universidad:** Universidad Galileo  
**Estudiante:** Maidellin Suset Alvarado Cayax  
**Curso:** Arquitectura del Proyecto 1  

---

## 📊 Resumen de Avances: Arquitectura y Base de Datos

### 🛠️ Stack Tecnológico
- **Entorno:** Node.js
- **Lenguaje:** TypeScript 
- **Servidor Web:** Express.js 
- **Base de Datos:** PostgreSQL
- **Contenedorización:** Docker 
- **ORM:** Prisma ORM (v7.4.0) configurado con ES Modules
- **Frontend:** React (Vite) + CSS puro para diseño profesional

---

## 🚀 Logros y Configuraciones 

1. **Inicialización del Entorno Backend:** Configuré el `package.json` utilizando el estándar moderno de JavaScript (`"type": "module"`) y establecí una configuración estricta de TypeScript mediante `tsconfig.json`.
2. **Despliegue de Base de Datos:** Creé y levanté un contenedor de Docker específico para el motor de PostgreSQL.
3. **Diseño del Esquema Relacional:**
   - Implementé **UUIDs automáticos** para las llaves primarias, mejorando la seguridad e integridad del sistema.
   - Diseñé un sistema de **Soft Deletes** (`deleted_at`) y auditoría de tiempos (`created_at`, `updated_at`) en todas las tablas clave para preservar el historial exacto de datos.
   - Utilicé **ENUMs** a nivel de base de datos para restringir de forma segura los valores de roles, estados, impacto y tipos de tickets.
   - Configuré el **Borrado en Cascada** (*Cascade Delete*) en las relaciones lógicas (ej. `Cliente -> Producto`) para mantener la base de datos limpia.
4. **Migración Exitosa:** Ejecuté los comandos de migración de Prisma, sincronizando mi esquema de código TypeScript directamente con la base de datos de PostgreSQL en Docker.
5. **Generación de Reportes:** Implementé la descarga de un reporte técnico en PDF integrando los datos de la base de datos de forma dinámica.

---

## 🗄️ Esquema de Base de Datos (Prisma Schema)

### Entidades Principales (El flujo de trabajo)

- **Usuarios (`User`):** Son los agentes que operan el sistema. Los protegí con identificadores universales (`UUID`) para evitar exponer la cantidad de usuarios registrados, y aseguré que las contraseñas se almacenen únicamente como hashes encriptados.
- **Clientes y Productos (`Customer` & `Product`):** Gestionan el catálogo. Utilicé el `NIT` como identificador único de la empresa. Si una empresa se da de baja, aseguré que sus productos se eliminen automáticamente gracias a la regla de borrado en cascada.
- **El Núcleo (`Ticket`):** Es la tabla central que une todo el ecosistema. Conecta un problema con un producto y un agente. Diseñé la magia de la escalación en la columna `current_level`; con solo actualizar este número (de `1` a `2`), el ticket pasa de un agente L1 a un L2 de forma limpia y eficiente.
- **Bitácora (`Comment`):** Funciona como el historial inmutable de seguimiento del ticket, vinculando qué usuario dijo qué cosa y en qué momento exacto.

### 🛡️ Auditoría Profesional
Aseguré que todas las tablas incluyan campos de auditoría automáticos (`created_at`, `updated_at`). Además, con el patrón de **Soft Delete** (`deleted_at`), garantizo que cuando un usuario "borra" un registro desde la interfaz, este no se destruye de la base de datos, sino que se oculta lógicamente. Esto protege el historial para futuras auditorías técnicas.

---
