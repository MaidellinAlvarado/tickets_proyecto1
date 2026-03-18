import { useEffect, useState } from 'react';
import './App.css'; 


// INTERFACES DE DATOS

interface User { user_id: string; full_name: string; }
interface Comment { comment_id: string; content: string; created_at: string; }
interface Ticket { ticket_id: string; subject: string; description: string; status: string; current_level: number; }

function App() {
  
  // ESTADOS DEL COMPONENTE

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  
  // Simulación de sesión: Almacena el ID del usuario seleccionado en la cabecera
  const [usuarioActivo, setUsuarioActivo] = useState<string>(""); 
  
  // Gestión de vistas: Controla qué ticket se está viendo en detalle
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  
  // Estados para la gestión de comentarios del ticket activo
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");


  // FUNCIONES DE CARGA DE DATOS (API FETCHING)


  
  const fetchData = async () => {
    try {
      // 1. Obtener listado de tickets
      const resT = await fetch('http://localhost:3000/api/tickets');
      const bodyT = await resT.json();
      if (bodyT.success) setTickets(bodyT.data);

      // 2. Obtener usuarios para poblar el selector de "Sesión activa"
      const resU = await fetch('http://localhost:3000/api/users');
      const bodyU = await resU.json();
      if (bodyU.success && bodyU.data.length > 0) {
        setUsuarios(bodyU.data);
        // Autoseleccionar el primer usuario de la base de datos por defecto
        setUsuarioActivo(bodyU.data[0].user_id);
      }
    } catch (err) { console.error("Error cargando datos principales:", err); }
  };

 
  const fetchComentarios = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${id}/comments`);
      const body = await res.json();
      if (body.success) setComentarios(body.data);
    } catch (err) { console.error("Error cargando comentarios:", err); }
  };


  // CICLO DE VIDA DEL COMPONENTE (EFECTOS)


  // Ejecutar fetchData solo una vez al montar el componente 
  useEffect(() => { fetchData(); }, []);

  // Escuchar cambios en el ticketSeleccionado para cargar sus comentarios dinámicamente
  useEffect(() => { 
    if (ticketSeleccionado) {
      fetchComentarios(ticketSeleccionado.ticket_id); 
    }
  }, [ticketSeleccionado]);


  // ACCIONES DEL USUARIO 
 

  const enviarComentario = async () => {
    // Validar que existan los datos mínimos requeridos
    if (!nuevoComentario || !ticketSeleccionado || !usuarioActivo) return;

    try {
      const res = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticket_id: ticketSeleccionado.ticket_id, 
          content: nuevoComentario, 
          user_id: usuarioActivo 
        })
      });

      if (res.ok) { 
        setNuevoComentario(""); // Limpiar el input
        fetchComentarios(ticketSeleccionado.ticket_id); // Refrescar el historial
      }
    } catch (err) { console.error("Error enviando comentario:", err); }
  };


  // RENDERIZADO DE LA INTERFAZ (JSX)

  return (
    <div className="app-container">
      <h1>Soporte Técnico Galileo</h1>

      {/* --- PANEL DE CONTROL SUPERIOR --- */}
      <div className="header-section">
        <div className="user-selector">
          <label>Sesión activa: </label>
          <select value={usuarioActivo} onChange={(e) => setUsuarioActivo(e.target.value)}>
            {usuarios.map(u => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}
          </select>
        </div>
        {/* Botón para descargar el reporte general en PDF, abre una nueva pestaña con el endpoint correspondiente */}
        <button className="btn-pdf" onClick={() => window.open('http://localhost:3000/api/tickets/reporte/pdf')}>
          📄 Reporte General PDF
        </button>
      </div>

      {/* --- TABLA PRINCIPAL DE TICKETS --- */}
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Asunto</th>
            <th>Estado</th>
            <th>Nivel</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.ticket_id}>
              <td>
                <button className="link-btn" onClick={() => setTicketSeleccionado(t)}>{t.subject}</button>
              </td>
              <td><span className={`status-badge ${t.status}`}>{t.status.toUpperCase()}</span></td>
              <td className="level-tag">L{t.current_level}</td>
              <td>
                {/* Lógica de cierre: Solo mostrar si el ticket no está ya cerrado */}
                {t.status !== 'closed' && (
                  <button className="btn-cerrar" onClick={async () => {
                    await fetch(`http://localhost:3000/api/tickets/${t.ticket_id}/cerrar`, { method: 'PATCH' });
                    fetchData(); 
                  }}>Cerrar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Solo se renderiza si hay un ticket seleccionado en el estado */}
      {ticketSeleccionado && (
        <div className="detail-card">
          <div className="detail-header">
            <h2>Detalle del Ticket</h2>
            <span className="ticket-id-tag">ID: {ticketSeleccionado.ticket_id.slice(0,8)}</span>
          </div>
          <p className="ticket-desc"><strong>Descripción:</strong> {ticketSeleccionado.description}</p>

          <div className="comments-section">
            <h4>Historial de Soporte</h4>
            <div className="comments-list">
              {comentarios.map(c => (
                <div key={c.comment_id} className="comment-box">
                  <p>{c.content}</p>
                  <small>{new Date(c.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
            
            {/* Formulario para añadir nueva documentación técnica al ticket */}
            <div className="comment-input-group">
              <input 
                value={nuevoComentario} 
                onChange={(e) => setNuevoComentario(e.target.value)} 
                placeholder="Escribir nota técnica..." 
              />
              <button className="btn-enviar" onClick={enviarComentario}>Enviar</button>
            </div>
          </div>
          
          <div className="detail-actions">
             {/* Lógica de escalado: Solo visible para L1 y si está abierto */}
             {ticketSeleccionado.current_level === 1 && ticketSeleccionado.status !== 'closed' && (
                <button className="btn-escalar" onClick={async () => {
                   await fetch(`http://localhost:3000/api/tickets/${ticketSeleccionado.ticket_id}/escalar`, { method: 'PATCH' });
                   fetchData();
                   setTicketSeleccionado(null); // Cerrar panel tras escalar
                }}>Escalar a L2</button>
             )}
             <button className="btn-volver" onClick={() => setTicketSeleccionado(null)}>Volver</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;