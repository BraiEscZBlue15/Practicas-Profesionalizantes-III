import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseAuth';

const SeccionContactos = () => {
    const [contactos, setContactos] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({ name: '', number: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarContactos();
    }, []);

    const cargarContactos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contactos')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setContactos(data || []);
        } catch (err) {
            console.error('Error al cargar contactos:', err);
            setError('Error al cargar los contactos');
        } finally {
            setLoading(false);
        }
    };

    const handleNuevo = () => {
        setFormData({ name: '', number: '' });
        setEditando(null);
        setMostrarForm(true);
    };

    const handleEditar = (contacto) => {
        setFormData({ name: contacto.name, number: contacto.number });
        setEditando(contacto.contactoId);
        setMostrarForm(true);
    };

    const handleEliminar = async (contactoId) => {
        if (!confirm('¿Estás seguro de eliminar este contacto?')) return;

        try {
            const { error } = await supabase
                .from('contactos')
                .delete()
                .eq('contactoId', contactoId);

            if (error) throw error;
            
            await cargarContactos();
        } catch (err) {
            console.error('Error al eliminar contacto:', err);
            alert('Error al eliminar el contacto');
        }
    };

    const handleGuardar = async () => {
        if (!formData.name || !formData.number) {
            alert("Completá todos los campos.");
            return;
        }

        try {
            if (editando) {
                // Actualizar contacto existente
                const { error } = await supabase
                    .from('contactos')
                    .update({ name: formData.name, number: formData.number })
                    .eq('contactoId', editando);

                if (error) throw error;
            } else {
                // Crear nuevo contacto
                const { error } = await supabase
                    .from('contactos')
                    .insert([{ name: formData.name, number: formData.number }]);

                if (error) throw error;
            }

            await cargarContactos();
            setMostrarForm(false);
            setFormData({ name: '', number: '' });
            setEditando(null);
        } catch (err) {
            console.error('Error al guardar contacto:', err);
            alert('Error al guardar el contacto');
        }
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setFormData({ name: '', number: '' });
        setEditando(null);
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            <div className="seccion-header">
                <h2>Contactos de Emergencia</h2>
                <p>Gestioná los números que se muestran en la página base</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="ph ph-warning-circle"></i>
                    {error}
                </div>
            )}
            
            {!mostrarForm && (
                <button className="btn btn-primary" onClick={handleNuevo} style={{ marginBottom: '1.5rem' }}>
                    <i className="ph ph-plus"></i> Agregar contacto
                </button>
            )}

            {mostrarForm && (
                <div className="form-interno" style={{ marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Nombre</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ej: Bomberos"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Número</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ej: 100 / 4664-2222"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        />
                    </div>
                    <div className="form-acciones">
                        <button className="btn btn-primary btn-sm" onClick={handleGuardar}>
                            {editando ? 'Actualizar' : 'Guardar'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={handleCancelar}>Cancelar</button>
                    </div>
                </div>
            )}

            <div className="tabla-contenedor">
                {contactos.length > 0 ? (
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Número</th>
                                <th style={{ width: '120px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contactos.map((contacto) => (
                                <tr key={contacto.contactoId}>
                                    <td>{contacto.name}</td>
                                    <td>{contacto.number}</td>
                                    <td>
                                        <div className="tabla-acciones">
                                            <button 
                                                className="btn-editar" 
                                                onClick={() => handleEditar(contacto)}
                                                title="Editar"
                                            >
                                                <i className="ph ph-pencil"></i>
                                            </button>
                                            <button 
                                                className="btn-eliminar" 
                                                onClick={() => handleEliminar(contacto.contactoId)}
                                                title="Eliminar"
                                            >
                                                <i className="ph ph-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="sin-datos">
                        <i className="ph ph-phone-slash"></i>
                        <h3>No hay contactos</h3>
                        <p>Agregá el primer contacto de emergencia usando el botón de arriba.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default SeccionContactos;
