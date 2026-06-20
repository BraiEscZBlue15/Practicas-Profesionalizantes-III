import { useState, useEffect } from 'react';
import { obtenerDeStorage, guardarEnStorage, generarId } from '../../utils/helpers';

const SeccionRecursos = () => {
    const [recursos, setRecursos] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({ titulo: '', descripcion: '', archivo_url: '' });

    useEffect(() => {
        const recursosGuardados = obtenerDeStorage("recursos") || [];
        setRecursos(recursosGuardados);
    }, []);

    const guardarRecursos = (nuevosRecursos) => {
        guardarEnStorage("recursos", nuevosRecursos);
        setRecursos(nuevosRecursos);
    };

    const handleNuevo = () => {
        setFormData({ titulo: '', descripcion: '', archivo_url: '' });
        setEditando(null);
        setMostrarForm(true);
    };

    const handleEditar = (index) => {
        setFormData(recursos[index]);
        setEditando(index);
        setMostrarForm(true);
    };

    const handleEliminar = (index) => {
        if (confirm('¿Eliminar este recurso?')) {
            const nuevosRecursos = recursos.filter((_, i) => i !== index);
            guardarRecursos(nuevosRecursos);
        }
    };

    const handleFileChange = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const url = URL.createObjectURL(archivo);
            setFormData({ ...formData, archivo_url: url });
        }
    };

    const handleGuardar = () => {
        if (!formData.titulo || !formData.descripcion) {
            alert("Completá título y descripción.");
            return;
        }

        let nuevosRecursos;
        if (editando !== null) {
            nuevosRecursos = [...recursos];
            nuevosRecursos[editando] = formData;
        } else {
            nuevosRecursos = [...recursos, { ...formData, id: generarId() }];
        }

        guardarRecursos(nuevosRecursos);
        setMostrarForm(false);
        setFormData({ titulo: '', descripcion: '', archivo_url: '' });
        setEditando(null);
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setFormData({ titulo: '', descripcion: '', archivo_url: '' });
        setEditando(null);
    };

    return (
        <>
            <div className="seccion-header">
                <h2>Recursos Complementarios</h2>
                <p>Gestioná guías, videos y material complementario de la página base</p>
            </div>
            
            {!mostrarForm && (
                <button className="btn btn-primary" onClick={handleNuevo} style={{ marginBottom: '1.5rem' }}>
                    <i className="ph ph-plus"></i> Agregar recurso
                </button>
            )}

            {mostrarForm && (
                <div className="form-interno" style={{ marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ej: Guía de Seguridad Escolar"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Descripción</label>
                        <textarea 
                            className="form-input" 
                            placeholder="Describí el contenido del recurso..."
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Archivo o enlace</label>
                        <input 
                            type="file" 
                            className="form-input" 
                            accept=".pdf,.docx,.pptx,.mp4,.jpg,.png"
                            onChange={handleFileChange}
                            style={{ paddingLeft: '0.75rem' }}
                        />
                    </div>
                    <div className="form-acciones">
                        <button className="btn btn-primary btn-sm" onClick={handleGuardar}>Guardar</button>
                        <button className="btn btn-outline btn-sm" onClick={handleCancelar}>Cancelar</button>
                    </div>
                </div>
            )}

            <div className="tabla-contenedor">
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Descripción</th>
                            <th>Archivo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recursos.length > 0 ? (
                            recursos.map((recurso, index) => (
                                <tr key={index}>
                                    <td>{recurso.titulo}</td>
                                    <td>{recurso.descripcion.substring(0, 60)}...</td>
                                    <td>
                                        {recurso.archivo_url ? (
                                            <span>
                                                <i className="ph ph-check-circle" style={{ color: '#16A34A' }}></i> Cargado
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-light)' }}>Sin archivo</span>
                                        )}
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline" 
                                            onClick={() => handleEditar(index)}
                                            title="Editar"
                                        >
                                            <i className="ph ph-pencil"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline" 
                                            onClick={() => handleEliminar(index)}
                                            title="Eliminar" 
                                            style={{ color: '#DC2626' }}
                                        >
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No hay recursos cargados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default SeccionRecursos;
