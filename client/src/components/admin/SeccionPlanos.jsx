import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { planosService, institucionesService } from '../../services/supabaseClient';
import { planosStorageService } from '../../services/supabaseStorage';
import '../../pages/Documentos.css';

const SeccionPlanos = () => {
    const { user } = useContext(AuthContext);
    const [planos, setPlanos] = useState([]);
    const [instituciones, setInstituciones] = useState([]);
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [selectedPlano, setSelectedPlano] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        institution: '',
        createdBy: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchPlanos();
        fetchInstituciones();
    }, []);

    useEffect(() => {
        // Auto-seleccionar el primer plano de la institución filtrada
        if (selectedInstitution) {
            const planosFiltrados = planos.filter(p => p.institution?.institutionId === selectedInstitution);
            if (planosFiltrados.length > 0) {
                setSelectedPlano(planosFiltrados[0]);
            } else {
                setSelectedPlano(null);
            }
        } else if (planos.length > 0) {
            setSelectedPlano(planos[0]);
        }
    }, [selectedInstitution, planos]);

    const fetchPlanos = async () => {
        try {
            const data = await planosService.getAll();
            console.log('📋 Planos cargados:', data);
            console.log('📋 Primer plano:', data[0]);
            if (data[0]) {
                console.log('   - institution:', data[0].institution);
                console.log('   - institutionid:', data[0].institution?.institutionid);
            }
            setPlanos(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar planos: ' + err.message);
        }
    };

    const fetchInstituciones = async () => {
        try {
            const data = await institucionesService.getAll();
            setInstituciones(data);
        } catch (err) {
            console.error('Error cargando instituciones:', err);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            if (!formData.name) {
                setFormData({ ...formData, name: file.name });
            }
        } else {
            alert('Solo se permiten archivos PDF');
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        try {
            const userId = user?.userId || formData.createdBy;
            let fileUrl = null;

            // Si hay archivo nuevo, subirlo
            if (selectedFile) {
                const uploadResult = await planosStorageService.uploadFile(
                    selectedFile,
                    'planos',
                    userId
                );
                fileUrl = uploadResult.url;
            }

            // Si no hay archivo y es creación nueva, error
            if (!editingId && !fileUrl) {
                throw new Error('Debe seleccionar un archivo PDF');
            }

            const submitData = {
                name: formData.name || selectedFile?.name || 'Sin nombre',
                url: fileUrl,
                institution: formData.institution || null,
                createdby: formData.createdBy || userId || null,
                modifiedby: formData.createdBy || userId || null
            };

            if (editingId) {
                await planosService.update(editingId, submitData);
            } else {
                await planosService.create(submitData);
            }

            // Limpiar y recargar
            setFormData({ name: '', institution: '', createdBy: '' });
            setSelectedFile(null);
            setEditingId(null);
            setShowForm(false);
            fetchPlanos();
        } catch (err) {
            setError(`Error al ${editingId ? 'actualizar' : 'crear'} plano: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (plano) => {
        setFormData({
            name: plano.name,
            institution: plano.institution?.institutionId || '',
            createdBy: plano.createdby?.userid || ''
        });
        setEditingId(plano.planoid);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (planoId, planoName) => {
        if (!window.confirm(`¿Eliminar el plano "${planoName}"?`)) return;

        try {
            await planosService.delete(planoId);
            fetchPlanos();
            if (selectedPlano?.planoid === planoId) {
                setSelectedPlano(null);
            }
        } catch (err) {
            setError('Error al eliminar plano: ' + err.message);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', institution: '', createdBy: '' });
        setSelectedFile(null);
        setEditingId(null);
        setShowForm(false);
    };

    const handleDownload = async (url, fileName) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al descargar el archivo');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'plano.pdf';
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (err) {
            console.error('Error descargando archivo:', err);
            alert('Error al descargar el archivo: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const planosFiltrados = selectedInstitution
        ? planos.filter(p => p.institution?.institutionId === selectedInstitution)
        : planos;

    return (
        <>
            <div className="seccion-header">
                <h2>📍 Planos de Evacuación</h2>
                <p>Gestiona los planos de evacuación por institución</p>
            </div>

            {error && (
                <div className="error-message" style={{ 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    backgroundColor: '#fee', 
                    border: '1px solid #fcc', 
                    borderRadius: '0.5rem',
                    color: '#c00'
                }}>
                    {error}
                </div>
            )}

            {/* Botón para abrir formulario */}
            {!showForm && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                        style={{ 
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        ➕ Cargar Plano
                    </button>
                </div>
            )}

            {/* Formulario de carga/edición */}
            {showForm && (
                <div className="card form-card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
                        {editingId ? '✏️ Editar Plano' : '📤 Nuevo Plano'}
                    </h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name">Nombre del Plano</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Plano Evacuación Edificio Principal"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="institution">Institución</label>
                                <select
                                    id="institution"
                                    value={formData.institution}
                                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar institución...</option>
                                    {instituciones.map((inst) => (
                                        <option key={inst.institutionId} value={inst.institutionId}>
                                            {inst.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label htmlFor="file">Archivo PDF</label>
                                <input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="file-input"
                                />
                                {selectedFile && (
                                    <p style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>
                                        ✅ Archivo seleccionado: {selectedFile.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={uploading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    opacity: uploading ? 0.6 : 1
                                }}
                            >
                                {uploading ? '⏳ Subiendo...' : (editingId ? '💾 Actualizar' : '📤 Cargar Plano')}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="btn btn-secondary"
                                disabled={uploading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    opacity: uploading ? 0.6 : 1
                                }}
                            >
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filtro por institución */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <label htmlFor="filter-institution" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                    🏫 Filtrar por Institución
                </label>
                <select
                    id="filter-institution"
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        color: '#1e293b',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">Seleccionar institución...</option>
                    {instituciones.map((inst) => (
                        <option key={inst.institutionId} value={inst.institutionId}>
                            {inst.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Visor de PDF */}
            {selectedPlano ? (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
                            {selectedPlano.name}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            🏫 {selectedPlano.institution?.name || 'Sin institución'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            Creado: {formatDate(selectedPlano.createdat)}
                        </p>
                    </div>

                    <div className="visor-container" style={{ height: '600px', marginBottom: '1rem' }}>
                        <iframe 
                            src={selectedPlano.url} 
                            title={selectedPlano.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '0.5rem'
                            }}
                        ></iframe>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleDownload(selectedPlano.url, selectedPlano.name)}
                            className="btn-action btn-download"
                        >
                            📥 Descargar
                        </button>
                        <button
                            onClick={() => handleEdit(selectedPlano)}
                            className="btn-action btn-edit"
                        >
                            ✏️ Editar
                        </button>
                        <button
                            onClick={() => handleDelete(selectedPlano.planoid, selectedPlano.name)}
                            className="btn-action btn-delete"
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}>📍</div>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                        {selectedInstitution 
                            ? 'No hay planos para esta institución' 
                            : 'No hay planos cargados. Haz clic en "Cargar Plano" para comenzar.'}
                    </p>
                </div>
            )}

            {/* Lista de planos */}
            {planosFiltrados.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                        📋 Todos los Planos ({planosFiltrados.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {planosFiltrados.map((plano) => (
                            <div
                                key={plano.planoid}
                                onClick={() => setSelectedPlano(plano)}
                                style={{
                                    padding: '1rem',
                                    border: selectedPlano?.planoid === plano.planoid ? '2px solid #10b981' : '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    backgroundColor: selectedPlano?.planoid === plano.planoid ? '#f0fdf4' : 'white',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                    📄 {plano.name}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    🏫 {plano.institution?.name || 'Sin institución'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default SeccionPlanos;
