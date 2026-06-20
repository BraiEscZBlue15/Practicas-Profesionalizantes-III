import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseAuth';
import { useAuth } from '../../context/AuthContext';

const SeccionProtocolos = () => {
    const { user } = useAuth();
    const [protocolos, setProtocolos] = useState([]);
    const [instituciones, setInstituciones] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [todasInstituciones, setTodasInstituciones] = useState(true);
    const [institucionSeleccionada, setInstitucionSeleccionada] = useState('');
    const [filtroInstitucion, setFiltroInstitucion] = useState(''); // Filtro para ver protocolos
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarProtocolos();
        cargarInstituciones();
    }, [filtroInstitucion]); // Recargar cuando cambie el filtro

    const cargarInstituciones = async () => {
        try {
            const { data, error } = await supabase
                .from('instituciones')
                .select('institutionId, name')
                .eq('active', true)
                .order('name', { ascending: true });

            if (error) throw error;
            setInstituciones(data || []);
        } catch (err) {
            console.error('Error al cargar instituciones:', err);
        }
    };

    const cargarProtocolos = async () => {
        try {
            setLoading(true);
            if (!user) {
                console.log('⚠️ No hay usuario en AuthContext');
                setProtocolos([]);
                setLoading(false);
                return;
            }

            // Si hay un filtro de institución seleccionado, filtrar por esa institución
            // Si NO hay filtro, mostrar TODOS los protocolos (para admin)
            if (filtroInstitucion) {
                console.log('🔍 Cargando protocolos para institución:', filtroInstitucion);
                
                // Obtener protocolos relacionados con la institución filtrada
                const { data: protocolosInst, error: errorInst } = await supabase
                    .from('protocolos_instituciones')
                    .select('protocoloId')
                    .eq('institutionId', filtroInstitucion);

                if (errorInst) {
                    console.error('❌ Error en protocolos_instituciones:', errorInst);
                    throw errorInst;
                }

                console.log('📋 Asociaciones encontradas:', protocolosInst);

                const protocoloIds = protocolosInst.map(pi => pi.protocoloId);

                if (protocoloIds.length === 0) {
                    console.log('ℹ️ No hay protocolos asociados a esta institución');
                    setProtocolos([]);
                    setLoading(false);
                    return;
                }

                // Obtener los protocolos completos
                const { data, error } = await supabase
                    .from('protocolos')
                    .select('*')
                    .in('protocoloId', protocoloIds)
                    .eq('active', true)
                    .order('createdAt', { ascending: false });

                if (error) {
                    console.error('❌ Error en protocolos:', error);
                    throw error;
                }
                
                console.log('✅ Protocolos cargados (filtrados):', data);
                setProtocolos(data || []);
            } else {
                // Sin filtro: mostrar TODOS los protocolos activos
                console.log('🔍 Cargando TODOS los protocolos (sin filtro)');
                
                const { data, error } = await supabase
                    .from('protocolos')
                    .select('*')
                    .eq('active', true)
                    .order('createdAt', { ascending: false });

                if (error) {
                    console.error('❌ Error en protocolos:', error);
                    throw error;
                }
                
                console.log('✅ Todos los protocolos cargados:', data);
                setProtocolos(data || []);
            }
        } catch (err) {
            console.error('Error al cargar protocolos:', err);
            setError('Error al cargar los protocolos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNuevo = () => {
        setFormData({ name: '', description: '' });
        setTodasInstituciones(true);
        setInstitucionSeleccionada('');
        setEditando(null);
        setMostrarForm(true);
    };

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setTodasInstituciones(checked);
        if (checked) {
            setInstitucionSeleccionada('');
        }
    };

    const handleInstitucionChange = (e) => {
        const value = e.target.value;
        setInstitucionSeleccionada(value);
        if (value) {
            setTodasInstituciones(false);
        }
    };

    const handleEditar = (protocolo) => {
        setFormData({ name: protocolo.name, description: protocolo.description });
        setEditando(protocolo.protocoloId);
        setMostrarForm(true);
    };

    const handleEliminar = async (protocoloId) => {
        if (!confirm('¿Eliminar este protocolo?')) return;

        try {
            // Soft delete - marcar como inactivo
            if (!user) return;
            const { error } = await supabase
                .from('protocolos')
                .update({ 
                    active: false,
                    modifiedBy: user.userId,
                    modifiedAt: new Date().toISOString()
                })
                .eq('protocoloId', protocoloId);

            if (error) throw error;
            
            await cargarProtocolos();
        } catch (err) {
            console.error('Error al eliminar protocolo:', err);
            alert('Error al eliminar el protocolo');
        }
    };

    const handleGuardar = async () => {
        if (!formData.name || !formData.description) {
            alert("Completá título y descripción.");
            return;
        }

        if (!todasInstituciones && !institucionSeleccionada) {
            alert("Seleccioná una institución o marcá 'Agregar a todas las instituciones'");
            return;
        }

        try {
            if (!user) {
                alert('Usuario no autenticado');
                return;
            }
            
            if (editando) {
                // Actualizar protocolo existente
                const { error } = await supabase
                    .from('protocolos')
                    .update({ 
                        name: formData.name, 
                        description: formData.description,
                        modifiedBy: user.userId,
                        modifiedAt: new Date().toISOString()
                    })
                    .eq('protocoloId', editando);

                if (error) throw error;
            } else {
                // Crear nuevo protocolo
                const { data: newProtocolo, error: errorProtocolo } = await supabase
                    .from('protocolos')
                    .insert([{ 
                        name: formData.name, 
                        description: formData.description,
                        createdBy: user.userId,
                        modifiedBy: user.userId
                    }])
                    .select()
                    .single();

                if (errorProtocolo) throw errorProtocolo;

                // Asociar el protocolo con instituciones
                if (todasInstituciones) {
                    // Asociar a todas las instituciones
                    const asociaciones = instituciones.map(inst => ({
                        protocoloId: newProtocolo.protocoloId,
                        institutionId: inst.institutionId
                    }));

                    const { error: errorAsociacion } = await supabase
                        .from('protocolos_instituciones')
                        .insert(asociaciones);

                    if (errorAsociacion) throw errorAsociacion;
                } else {
                    // Asociar solo a la institución seleccionada
                    const { error: errorAsociacion } = await supabase
                        .from('protocolos_instituciones')
                        .insert([{
                            protocoloId: newProtocolo.protocoloId,
                            institutionId: institucionSeleccionada
                        }]);

                    if (errorAsociacion) throw errorAsociacion;
                }
            }

            await cargarProtocolos();
            setMostrarForm(false);
            setFormData({ name: '', description: '' });
            setTodasInstituciones(true);
            setInstitucionSeleccionada('');
            setEditando(null);
        } catch (err) {
            console.error('Error al guardar protocolo:', err);
            alert('Error al guardar el protocolo');
        }
    };

    const handleCancelar = () => {
        setMostrarForm(false);
        setFormData({ name: '', description: '' });
        setTodasInstituciones(true);
        setInstitucionSeleccionada('');
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
                <h2>Protocolos Vigentes</h2>
                <p>Gestioná los protocolos que se muestran en la página base</p>
            </div>

            {/* Filtro de institución */}
            <div className="form-group" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                <label className="form-label">Filtrar por institución</label>
                <select 
                    className="form-input"
                    value={filtroInstitucion}
                    onChange={(e) => setFiltroInstitucion(e.target.value)}
                    style={{ cursor: 'pointer' }}
                >
                    <option value="">Todas las instituciones</option>
                    {instituciones.map(inst => (
                        <option key={inst.institutionId} value={inst.institutionId}>
                            {inst.name}
                        </option>
                    ))}
                </select>
                {filtroInstitucion && (
                    <small style={{ color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                        Mostrando solo protocolos de la institución seleccionada
                    </small>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="ph ph-warning-circle"></i>
                    {error}
                </div>
            )}
            
            {!mostrarForm && (
                <button className="btn btn-primary" onClick={handleNuevo} style={{ marginBottom: '1.5rem' }}>
                    <i className="ph ph-plus"></i> Agregar protocolo
                </button>
            )}

            {mostrarForm && (
                <div className="form-interno" style={{ marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ej: Protocolo de Incendio"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Descripción</label>
                        <textarea 
                            className="form-input" 
                            placeholder="Describí el contenido del protocolo..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="4"
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={todasInstituciones}
                                onChange={handleCheckboxChange}
                                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                            />
                            Agregar a todas las instituciones
                        </label>
                    </div>

                    {!todasInstituciones && (
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label className="form-label">Institución específica</label>
                            <select 
                                className="form-input"
                                value={institucionSeleccionada}
                                onChange={handleInstitucionChange}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">Seleccionar institución...</option>
                                {instituciones.map(inst => (
                                    <option key={inst.institutionId} value={inst.institutionId}>
                                        {inst.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-acciones">
                        <button className="btn btn-primary btn-sm" onClick={handleGuardar}>
                            {editando ? 'Actualizar' : 'Guardar'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={handleCancelar}>Cancelar</button>
                    </div>
                </div>
            )}

            <div className="lista-items">
                {protocolos.length > 0 ? (
                    protocolos.map((protocolo) => (
                        <div key={protocolo.protocoloId} className="item-card">
                            <div className="item-header">
                                <div>
                                    <h3 className="item-titulo">{protocolo.name}</h3>
                                    <p className="item-descripcion">{protocolo.description}</p>
                                    <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                                        Creado: {new Date(protocolo.createdAt).toLocaleDateString('es-AR')}
                                    </small>
                                </div>
                                <div className="item-acciones">
                                    <button 
                                        className="btn-editar" 
                                        onClick={() => handleEditar(protocolo)}
                                        title="Editar"
                                    >
                                        <i className="ph ph-pencil"></i>
                                    </button>
                                    <button 
                                        className="btn-eliminar" 
                                        onClick={() => handleEliminar(protocolo.protocoloId)}
                                        title="Eliminar"
                                    >
                                        <i className="ph ph-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="sin-datos">
                        <i className="ph ph-clipboard-text"></i>
                        <h3>No hay protocolos</h3>
                        <p>Agregá el primer protocolo usando el botón de arriba.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default SeccionProtocolos;
