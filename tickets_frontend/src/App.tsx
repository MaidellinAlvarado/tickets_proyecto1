import { useEffect, useState } from 'react';
import './App.css'; 

// INTERFACES DE DATOS 
interface User { user_id: string; full_name: string; role: string; } 
interface Comment { comment_id: string; content: string; created_at: string; }
interface Ticket { ticket_id: string; subject: string; description: string; status: string; current_level: number; }

function App() {
  
  // ESTADOS DEL COMPONENTE
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  
  // Guardamos el objeto de usuario completo
  const [usuarioActivo, setUsuarioActivo] = useState<User | null>(null); 
  
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");

  // FUNCIONES DE CARGA DE DATOS 
  const fetchData = async () => {
    try {
      const resT = await fetch('http://localhost:3000/api/tickets');
      const bodyT = await resT.json();
      if (bodyT.success) setTickets(bodyT.data);

      const resU = await fetch('http://localhost:3000/api/users');
      const bodyU = await resU.json();
      if (bodyU.success && bodyU.data.length > 0) {
        setUsuarios(bodyU.data);
        if (!usuarioActivo) setUsuarioActivo(bodyU.data[0]); 
      }
    } catch (err) { console.error("Error cargando datos principales:", err); }
  };

  const fetchComentarios = async (id: string) => {
    try {
      // Los comentarios ya vienen ordenados por fecha y sin borrados lógicos
      const res = await fetch(`http://localhost:3000/api/tickets/${id}/comments`);
      const body = await res.json();
      if (body.success) setComentarios(body.data);
    } catch (err) { console.error("Error cargando comentarios:", err); }
  };

  // CICLO DE VIDA
  useEffect(() => { fetchData(); }, []);

  useEffect(() => { 
    if (ticketSeleccionado) {
      fetchComentarios(ticketSeleccionado.ticket_id); 
    }
  }, [ticketSeleccionado]);

  // ACCIONES DEL USUARIO 
  const manejarCambioUsuario = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = usuarios.find(u => u.user_id === e.target.value);
    if (user) setUsuarioActivo(user);
  };

  const enviarComentario = async () => {
    if (!nuevoComentario || !ticketSeleccionado || !usuarioActivo) return;

    try {
      const res = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticket_id: ticketSeleccionado.ticket_id, 
          content: nuevoComentario, 
          user_id: usuarioActivo.user_id 
        })
      });

      if (res.ok) { 
        setNuevoComentario(""); 
        fetchComentarios(ticketSeleccionado.ticket_id); 
      }
    } catch (err) { console.error("Error enviando comentario:", err); }
  };

  // RENDERIZADO DE LA INTERFAZ
  return (
    <div className="app-container">
      <h1>Soporte Técnico Galileo</h1>

      {/* --- PANEL DE CONTROL SUPERIOR --- */}
      <div className="header-section">
        <div className="user-selector">
          <label>Sesión activa: </label>
          <select value={usuarioActivo?.user_id || ""} onChange={manejarCambioUsuario}>
            {usuarios.map(u => (
              <option key={u.user_id} value={u.user_id}>
                {u.full_name} ({u.role === 'l1_agent' ? 'L1' : 'L2'})
              </option>
            ))}
          </select>
        </div>
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
                
                {t.status !== 'closed' && (
                  <button className="btn-cerrar" onClick={async () => {
                    await fetch(`http://localhost:3000/api/tickets/${t.ticket_id}/cerrar`, { method: 'PATCH' });
                    fetchData(); 
                    if (ticketSeleccionado?.ticket_id === t.ticket_id) setTicketSeleccionado(null);
                  }}>Cerrar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---DETALLE DEL TICKET --- */}
      {ticketSeleccionado && (
        <div className="detail-card">
          <div className="detail-header">
            <h2>Detalle del Ticket</h2>
            <span className="ticket-id-tag">ID: {ticketSeleccionado.ticket_id.slice(0,8)}</span>
          </div>
          <p className="ticket-desc"><strong>Descripción:</strong> {ticketSeleccionado.description || 'Sin descripción'}</p>

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
        
             {ticketSeleccionado.current_level === 1 && ticketSeleccionado.status !== 'closed' && usuarioActivo?.role === 'l1_agent' && (
                <button className="btn-escalar" onClick={async () => {
                   await fetch(`http://localhost:3000/api/tickets/${ticketSeleccionado.ticket_id}/escalar`, { method: 'PATCH' });
                   fetchData();
                   setTicketSeleccionado(null); 
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