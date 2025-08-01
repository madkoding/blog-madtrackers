'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { UserTracking } from '../../../interfaces/tracking';

interface EmailForm {
  recipients: 'all' | 'selected';
  selectedUsers: string[];
  subject: string;
  message: string;
}

export default function CorreosPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [users, setUsers] = useState<UserTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [emailForm, setEmailForm] = useState<EmailForm>({
    recipients: 'all',
    selectedUsers: [],
    subject: '',
    message: ''
  });

  const emailTemplates = [
    {
      name: 'Actualización de Estado',
      subject: 'Actualización de tu pedido - MadTrackers',
      message: `Hola {nombre},

Te escribimos para informarte sobre el estado actual de tu pedido de trackers SlimeVR.

Tu pedido está progresando según lo planificado y pronto tendrás más noticias.

Si tienes alguna pregunta, no dudes en contactarnos.

¡Gracias por tu paciencia!`
    },
    {
      name: 'Información General',
      subject: 'Información importante - MadTrackers',
      message: `Hola {nombre},

Esperamos que estés bien. Te escribimos para compartir información importante sobre nuestros servicios.

[Escribe aquí tu mensaje personalizado]

Si necesitas ayuda o tienes preguntas, estamos aquí para apoyarte.

Saludos cordiales.`
    },
    {
      name: 'Mensaje Personalizado',
      subject: '',
      message: 'Hola {nombre},\n\n[Escribe tu mensaje aquí]\n\nSaludos.'
    }
  ];

  const applyTemplate = (template: typeof emailTemplates[0]) => {
    setEmailForm(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }));
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener el token JWT del localStorage
      const token = localStorage.getItem('madtrackers_jwt');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        throw new Error('Error al cargar usuarios');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    setEmailForm(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSelectAll = () => {
    setEmailForm(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.length === users.length 
        ? [] 
        : users.map(user => user.id!)
    }));
  };

  const handleSendEmails = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      setError('Por favor completa el asunto y mensaje del correo');
      return;
    }

    if (emailForm.recipients === 'selected' && emailForm.selectedUsers.length === 0) {
      setError('Por favor selecciona al menos un usuario');
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      // Obtener el token JWT del localStorage
      const token = localStorage.getItem('madtrackers_jwt');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients: emailForm.recipients,
          selectedUserIds: emailForm.selectedUsers,
          subject: emailForm.subject,
          message: emailForm.message
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        throw new Error('Error al enviar correos');
      }

      const result = await response.json();
      
      if (result.method === 'single_personalized') {
        setSuccess(`✅ Correo personalizado enviado a ${result.mainRecipient} (copia en BCC a ${result.bccRecipient})`);
      } else if (result.method === 'bulk_bcc') {
        setSuccess(`✅ Correo masivo enviado con ${result.sentCount} destinatarios en BCC (principal: ${result.mainRecipient})`);
      } else {
        setSuccess(`✅ Correos enviados exitosamente a ${result.sentCount} usuarios`);
      }
      
      // Limpiar formulario
      setEmailForm({
        recipients: 'all',
        selectedUsers: [],
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending emails:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar los correos. Por favor intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Verificando permisos...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Acceso no autorizado. Por favor inicia sesión.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            📧 Enviar Correos a Usuarios
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Plantillas de correo */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                📝 Plantillas de correo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {emailTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => applyTemplate(template)}
                    className="p-3 text-left border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {template.subject || 'Sin asunto predefinido'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                💡 <strong>Variables disponibles:</strong><br/>
                <div className="grid grid-cols-2 gap-1 mt-1 ml-2">
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{nombre}'}</code> o <code className="bg-gray-100 px-1 rounded text-xs">{'{nombreUsuario}'}</code></span>
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{email}'}</code> o <code className="bg-gray-100 px-1 rounded text-xs">{'{contacto}'}</code></span>
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{numeroTrackers}'}</code></span>
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{sensor}'}</code></span>
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{colorCase}'}</code></span>
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{colorTapa}'}</code></span>
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{paisEnvio}'}</code></span>
                  <span>• <code className="bg-gray-100 px-1 rounded text-xs">{'{estadoPedido}'}</code></span>
                </div>
                📧 <strong>1 usuario</strong>: Correo personalizado al usuario + BCC a madkoding@gmail.com<br/>
                📧 <strong>Múltiples usuarios</strong>: Correo masivo con BCC (variables → texto genérico)
              </div>
            </div>
            {/* Selección de destinatarios */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Destinatarios
              </legend>
              <div className="space-y-2">
                <label className="flex items-center text-gray-900">
                  <input
                    type="radio"
                    name="recipients"
                    value="all"
                    checked={emailForm.recipients === 'all'}
                    onChange={(e) => setEmailForm(prev => ({ 
                      ...prev, 
                      recipients: e.target.value as 'all' | 'selected',
                      selectedUsers: []
                    }))}
                    className="mr-2"
                  />
                  {' '}Todos los usuarios ({users.length})
                </label>
                <label className="flex items-center text-gray-900">
                  <input
                    type="radio"
                    name="recipients"
                    value="selected"
                    checked={emailForm.recipients === 'selected'}
                    onChange={(e) => setEmailForm(prev => ({ 
                      ...prev, 
                      recipients: e.target.value as 'all' | 'selected'
                    }))}
                    className="mr-2"
                  />
                  {' '}Usuarios seleccionados
                </label>
              </div>
            </fieldset>

            {/* Lista de usuarios para selección */}
            {emailForm.recipients === 'selected' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="block text-sm font-medium text-gray-700">
                    Seleccionar usuarios
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {emailForm.selectedUsers.length === users.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {loading && <div>Cargando usuarios...</div>}
                  {!loading && users.length === 0 && <div>No hay usuarios disponibles</div>}
                  {!loading && users.length > 0 && (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <label key={user.id} className="flex items-center text-gray-900">
                          <input
                            type="checkbox"
                            checked={emailForm.selectedUsers.includes(user.id!)}
                            onChange={() => handleUserSelection(user.id!)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-900">
                            {user.nombreUsuario} ({user.contacto})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {emailForm.selectedUsers.length > 0 && (
                  <div className="text-sm text-gray-900 mt-2">
                    {emailForm.selectedUsers.length} usuario(s) seleccionado(s)
                  </div>
                )}
              </div>
            )}

            {/* Asunto */}
            <div>
              <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-2">
                Asunto
              </label>
              <input
                id="email-subject"
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Asunto del correo"
              />
            </div>

            {/* Mensaje */}
            <div>
              <label htmlFor="email-message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje
              </label>
              <textarea
                id="email-message"
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe aquí el contenido del correo..."
              />
            </div>

            {/* Botón enviar */}
            <div className="flex justify-end">
              <button
                onClick={handleSendEmails}
                disabled={sending || loading}
                className={`px-6 py-2 rounded-md font-medium ${
                  sending || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {sending ? 'Enviando...' : 'Enviar Correos'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
