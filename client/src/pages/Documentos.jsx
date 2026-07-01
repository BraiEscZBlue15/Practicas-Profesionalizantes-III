import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentosService, usuariosService, institucionesService } from '../services/supabaseClient'
import { storageService } from '../services/supabaseStorage'
import { useAuth } from '../context/AuthContext'
import './Documentos.css'

function Documentos() {
  const navigate = useNavigate()
  const { user, esAdministrador } = useAuth()

  const puedeEditarDocumento = (doc) => {
    if (esAdministrador) return true

    const creatorId = typeof doc.createdBy === 'object' ? doc.createdBy?.userId : doc.createdBy
    const ownerId = typeof doc.owner === 'object' ? doc.owner?.userId : doc.owner

    if (!user?.userId) return false

    return creatorId === user.userId || ownerId === user.userId
  }
  const [documentos, setDocumentos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [instituciones, setInstituciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [selectedTiers, setSelectedTiers] = useState({
    tier1: false,
    tier2: false,
    tier3: false,
    tier4: false
  })

  // Estado del formulario
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    url: '',
    institution: '',
    owner: ''
  })

  // Cargar datos iniciales y verificar rol
  useEffect(() => {
    loadInitialData()
    loadUserRole()
  }, [])

  const loadUserRole = async () => {
    try {
      // Intentar obtener del localStorage primero
      const storedUser = localStorage.getItem('user')
      console.log('💾 localStorage.user (raw):', storedUser)

      if (storedUser) {
        const user = JSON.parse(storedUser)
        console.log('📋 Usuario parseado completo:', user)
        console.log('🎭 user.role:', user.role)
        console.log('📝 user.role?.name:', user.role?.name)

        // Si el rol no está enriquecido (es solo un UUID string), buscar el usuario completo
        if (user.userId && (!user.role || typeof user.role === 'string')) {
          console.log('⚠️ Rol no enriquecido, obteniendo desde Supabase...')
          const fullUser = await usuariosService.getById(user.userId)
          console.log('📥 Usuario completo desde Supabase:', fullUser)

          // Actualizar localStorage con datos completos
          const updatedUser = {
            email: fullUser.email,
            userId: fullUser.userId,
            name: fullUser.name,
            surname: fullUser.surname,
            role: fullUser.role
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))

          const roleName = fullUser.role?.name?.toLowerCase()
          setUserRole(roleName)
          console.log('✅ Rol actualizado:', roleName)
        } else {
          // El rol ya está enriquecido
          const roleName = user.role?.name?.toLowerCase()
          setUserRole(roleName)
          console.log('👤 Rol del usuario final:', roleName)
        }
      } else {
        console.warn('⚠️ No hay usuario en localStorage')
      }
    } catch (error) {
      console.error('❌ Error cargando rol del usuario:', error)
    }
  }

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [documentosData, usuariosData, institucionesData] = await Promise.all([
        documentosService.getAll(),
        usuariosService.getAll(),
        institucionesService.getAll()
      ])
      setDocumentos(documentosData)
      setUsuarios(usuariosData)
      setInstituciones(institucionesData)
      setError(null)
    } catch (err) {
      setError('Error al cargar datos: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentos = async () => {
    try {
      const data = await documentosService.getAll()
      setDocumentos(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar documentos: ' + err.message)
    }
  }

  const handleDownload = async (url, fileName) => {
    try {
      // Forzar descarga del archivo
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al descargar el archivo')

      const blob = await response.blob()

      // Crear enlace temporal y forzar descarga
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName || 'documento'
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      // Limpiar después de un pequeño delay
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (err) {
      console.error('Error descargando archivo:', err)
      alert('Error al descargar el archivo: ' + err.message)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === '') {
      fetchDocumentos()
      return
    }

    try {
      const data = await documentosService.search(value)
      setDocumentos(data)
      setError(null)
    } catch (err) {
      setError('Error en la búsqueda: ' + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setUploading(true)
      let fileUrl = formData.url

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        let userId = user?.userId || null

        // Si es administrador y tiene checkboxes seleccionados, usar tier manual
        let manualTier = null
        if (userRole === 'administrador') {
          const selectedTierKeys = Object.keys(selectedTiers).filter(key => selectedTiers[key])
          if (selectedTierKeys.length > 0) {
            // Obtener el tier MAYOR (tier4 > tier3 > tier2 > tier1)
            const tierNumbers = selectedTierKeys.map(t => parseInt(t.replace('tier', '')))
            const maxTierNumber = Math.max(...tierNumbers)
            manualTier = `tier${maxTierNumber}`
          }
        }

        // Subir archivo con userId y tier manual (si existe)
        const uploadResult = await storageService.uploadFile(
          selectedFile,
          'archivos',
          userId,
          manualTier
        )
        fileUrl = uploadResult.url

        console.log(`Archivo subido con tier: ${uploadResult.tier}`)
      }

      // Si no hay archivo y es creación nueva, error
      if (!editingId && !fileUrl) {
        throw new Error('Debe seleccionar un archivo')
      }

      const submitData = {
        name: formData.name || selectedFile?.name || 'Sin nombre',
        type: formData.type || selectedFile?.type || null,
        url: fileUrl,
        institution: formData.institution || null,
        owner: formData.owner || null
      }

      if (editingId) {
        submitData.modifiedBy = user?.userId || null
        await documentosService.update(editingId, submitData)
      } else {
        submitData.createdBy = user?.userId || null
        submitData.modifiedBy = user?.userId || null
        await documentosService.create(submitData)
      }

      // Limpiar y recargar
      setFormData({ name: '', type: '', url: '', institution: '', owner: '' })
      setSelectedFile(null)
      setEditingId(null)
      setShowForm(false)
      fetchDocumentos()
    } catch (err) {
      setError(`Error al ${editingId ? 'actualizar' : 'crear'} documento: ${err.response?.data?.error || err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (documento) => {
    setFormData({
      name: documento.name,
      type: documento.type || '',
      url: documento.url,
      institution: documento.institution?.institutionId || '',
      owner: documento.owner?.userId || ''
    })
    setEditingId(documento.documentId)
    setShowForm(true)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return

    try {
      await documentosService.delete(id)
      fetchDocumentos()
    } catch (err) {
      setError('Error al eliminar: ' + err.message)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', type: '', url: '', institution: '', owner: '' })
    setSelectedFile(null)
    setSelectedTiers({ tier1: false, tier2: false, tier3: false, tier4: false })
    setEditingId(null)
    setShowForm(false)
  }

  const handleNewClick = () => {
    // Verificar si el usuario está autenticado
    const user = localStorage.getItem('user')

    if (!user) {
      // Redirigir al login si no está autenticado
      navigate('/login')
      return
    }

    setFormData({ name: '', type: '', url: '', institution: '', owner: '' })
    setSelectedFile(null)
    setSelectedTiers({ tier1: false, tier2: false, tier3: false, tier4: false })
    setEditingId(null)
    setShowForm(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Auto-completar nombre y tipo
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: file.name,
          type: file.type
        }))
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (user) => {
    if (!user) return '-'
    return `${user.name} ${user.surname}`
  }

  return (
    <div className="documentos-page">
      <div className="container">
        <div className="page-header">
          <h1>Gestión de Documentos</h1>
          <button
            onClick={handleNewClick}
            className="btn btn-primary"
          >
            + Nuevo Documento
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-btn">×</button>
          </div>
        )}

        {/* Formulario de Creación/Edición */}
        {showForm && (
          <div className="card form-card">
            <h2>{editingId ? 'Editar Documento' : 'Nuevo Documento'}</h2>
            <form onSubmit={handleSubmit} className="form">

              {/* Selector de Archivo */}
              {!editingId && (
                <div className="form-group">
                  <label htmlFor="file">
                    📎 Seleccionar Archivo {!editingId && '*'}
                  </label>
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    accept="*/*"
                    className="file-input"
                  />
                  {selectedFile && (
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Control de Tiers - Solo para Administradores */}
              {!editingId && selectedFile && (
                <div className="form-group tier-selection">
                  <label>🎯 Permisos de Acceso al Documento</label>
                  <p className="tier-helper">
                    {userRole === 'administrador'
                      ? 'Selecciona los roles que podrán acceder a este documento'
                      : `Solo administradores pueden cambiar permisos. Tu rol: ${userRole || 'desconocido'}`
                    }
                  </p>
                  {userRole === 'administrador' ? (
                    <>
                      <div className="tier-checkboxes">
                        <label className="tier-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedTiers.tier1}
                            onChange={(e) => setSelectedTiers({ ...selectedTiers, tier1: e.target.checked })}
                          />
                          <span>Administrador</span>
                        </label>
                        <label className="tier-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedTiers.tier2}
                            onChange={(e) => setSelectedTiers({ ...selectedTiers, tier2: e.target.checked })}
                          />
                          <span>Directivos</span>
                        </label>
                        <label className="tier-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedTiers.tier3}
                            onChange={(e) => setSelectedTiers({ ...selectedTiers, tier3: e.target.checked })}
                          />
                          <span>Estudiantes</span>
                        </label>
                        <label className="tier-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedTiers.tier4}
                            onChange={(e) => setSelectedTiers({ ...selectedTiers, tier4: e.target.checked })}
                          />
                          <span>Público</span>
                        </label>
                      </div>
                      {Object.values(selectedTiers).some(v => v) && (
                        <div className="tier-info">
                          ℹ️ Se asignará el nivel más abierto seleccionado
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="tier-info">
                      ℹ️ El documento se subirá con tu nivel de permisos actual
                    </div>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group form-group-wide">
                  <label htmlFor="name">Nombre del Documento *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Reglamento Institucional 2026"
                    autoFocus={!selectedFile}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Tipo</label>
                  <input
                    type="text"
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Ej: PDF, DOCX, Imagen"
                  />
                </div>
              </div>

              {editingId && (
                <div className="form-group">
                  <label htmlFor="url">URL del Documento</label>
                  <input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://ejemplo.com/documento.pdf"
                    readOnly
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="institution">Institución</label>
                  <select
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  >
                    <option value="">Seleccionar institución...</option>
                    {instituciones.map((inst) => (
                      <option key={inst.institutionId} value={inst.institutionId}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="owner">Propietario</label>
                  <select
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  >
                    <option value="">Seleccionar propietario...</option>
                    {usuarios.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.name} {user.surname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Subiendo...' : (editingId ? 'Actualizar' : 'Crear')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={uploading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de Búsqueda */}
        <div className="card search-card">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre o tipo..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  fetchDocumentos()
                }}
                className="clear-search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Lista de Documentos */}
        <div className="card">
          <div className="card-header">
            <h2>Documentos Registrados</h2>
            <span className="count-badge">
              {documentos.length} {documentos.length === 1 ? 'documento' : 'documentos'}
            </span>
          </div>

          {loading ? (
            <div className="loading">Cargando documentos...</div>
          ) : documentos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📄</span>
              <p>
                {searchTerm
                  ? 'No se encontraron resultados para tu búsqueda'
                  : 'No hay documentos registrados. ¡Crea el primero!'}
              </p>
            </div>
          ) : (
            <div className="documentos-grid">
              {documentos.map((doc) => (
                <div key={doc.documentId} className="documento-card">
                  <div className="documento-header">
                    <div className="documento-title">
                      <h3>{doc.name}</h3>
                      {doc.type && <span className="badge badge-type">{doc.type}</span>}
                    </div>
                  </div>

                  <div className="documento-body">
                    <div className="documento-info">
                      <div className="info-row">
                        <span className="info-label">📍 Institución:</span>
                        <span className="info-value">{doc.institution?.name || '-'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">👤 Propietario:</span>
                        <span className="info-value">{getUserName(doc.owner)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">🔗 URL:</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="documento-link"
                          title={doc.url}
                        >
                          Abrir documento
                        </a>
                      </div>
                    </div>

                    <div className="documento-meta">
                      <small>
                        Creado: {formatDate(doc.createdAt)}
                        {doc.createdBy && ` por ${getUserName(doc.createdBy)}`}
                      </small>
                      {doc.modifiedAt !== doc.createdAt && (
                        <small>
                          Modificado: {formatDate(doc.modifiedAt)}
                          {doc.modifiedBy && ` por ${getUserName(doc.modifiedBy)}`}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="documento-actions">
                    <button
                      onClick={() => handleDownload(doc.url, doc.name)}
                      className="btn-action btn-download"
                      title="Descargar"
                    >
                      📥 Descargar
                    </button>
                    {puedeEditarDocumento(doc) && (
                      <button
                        onClick={() => handleEdit(doc)}
                        className="btn-action btn-edit"
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                    )}
                    {puedeEditarDocumento(doc) && (
                      <button
                        onClick={() => handleDelete(doc.documentId, doc.name)}
                        className="btn-action btn-delete"
                        title="Eliminar"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Documentos
