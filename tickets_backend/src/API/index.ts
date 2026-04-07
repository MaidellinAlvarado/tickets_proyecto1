import express from 'express';
import cors from 'cors';
import { TicketController } from './controllerTicket.js';
import { UserController } from './controllerUser.js'; 
import { controllerComments } from './controllerComments.js';

// Configuración y Middlewares
const PORT = process.env.PORT || 3000; 
const app = express();

// Middlewares globales vitales
app.use(cors()); 
app.use(express.json());

// Instancias de Controladores 
const ticketController = new TicketController();
const userController = new UserController();
const commentController = new controllerComments();

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API de Soporte' });
});

// RUTAS DE USUARIOS
app.get('/api/users', (req, res) => userController.listar(req, res));
app.post('/api/users', (req, res) => userController.crear(req, res));


// RUTAS DE TICKETS
// 1. Crear y Listar
app.post('/api/tickets', (req, res) => ticketController.crear(req, res));
app.get('/api/tickets', (req, res) => ticketController.listar(req, res));

// 2. Rutas estáticas 
app.get('/api/tickets/reporte/pdf', (req, res) => ticketController.descargarReporte(req, res)); 
app.get('/api/tickets/:id', (req, res) => ticketController.obtenerPorId(req, res));
app.delete('/api/tickets/comments/:id', (req, res) => ticketController.eliminar(req, res));
app.patch('/api/tickets/:id/escalar', (req, res) => ticketController.escalar(req, res));
app.patch('/api/tickets/:id/cerrar', (req, res) => ticketController.cerrar(req, res));


// RUTA DE COMENTARIOS 
app.get('/api/tickets/:id/comments', (req, res) => commentController.listarPorTicket(req, res));
app.post('/api/comments', (req, res) => commentController.crear(req, res));

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en la capa API en http://localhost:${PORT}`);
});