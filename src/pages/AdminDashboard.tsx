import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Organization, OrganizationUser } from '../types'

export function AdminDashboard() {
  const { organizationRole, signOut } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [users, setUsers] = useState<OrganizationUser[]>([])
  const [newVendorEmail, setNewVendorEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organizationRole) {
      fetchOrganizationDetails()
      fetchOrganizationUsers()
    }
  }, [organizationRole])

  async function fetchOrganizationDetails() {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationRole?.organization_id)
        .single()

      if (error) throw error
      setOrganization(data)
    } catch (error) {
      console.error('Error al obtener detalles de la organización:', error)
    }
  }

  async function fetchOrganizationUsers() {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          *,
          user:user_id(email)
        `)
        .eq('organization_id', organizationRole?.organization_id)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createVendor(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newVendorEmail,
        password: 'temporary-password',
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: orgError } = await supabase
          .from('organization_users')
          .insert([
            {
              organization_id: organizationRole?.organization_id,
              user_id: authData.user.id,
              role: 'vendor',
            },
          ])

        if (orgError) throw orgError

        setNewVendorEmail('')
        fetchOrganizationUsers()
      }
    } catch (error) {
      console.error('Error al crear vendedor:', error)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        {organization && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">Detalles de la Organización</h2>
            <p className="text-gray-600">{organization.name}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Vendedor</h2>
          <form onSubmit={createVendor} className="flex gap-4">
            <input
              type="email"
              value={newVendorEmail}
              onChange={(e) => setNewVendorEmail(e.target.value)}
              placeholder="Correo del Vendedor"
              className="flex-1 px-4 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Agregar Vendedor
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">Usuarios de la Organización</h2>
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{(user as any).user?.email}</p>
                    <p className="text-sm text-gray-500">
                      Rol: {user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No hay usuarios en esta organización
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
