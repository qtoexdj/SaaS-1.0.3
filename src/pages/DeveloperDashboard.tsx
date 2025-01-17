import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Organization, OrganizationUser } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { Trash2, ChevronDown, ChevronRight, Users } from 'lucide-react'

interface OrganizationWithUsers extends Organization {
  users?: Array<OrganizationUser & { user_email?: string }>
}

export function DeveloperDashboard() {
  const [organizations, setOrganizations] = useState<OrganizationWithUsers[]>([])
  const [newOrgName, setNewOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())
  const { signOut } = useAuth()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Error al obtener organizaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrganizationUsers(orgId: string) {
    try {
      const { data: orgUsers, error: usersError } = await supabase
        .from('organization_users')
        .select(`
          *,
          user:user_id (
            email
          )
        `)
        .eq('organization_id', orgId)

      if (usersError) throw usersError

      setOrganizations(orgs =>
        orgs.map(org => {
          if (org.id === orgId) {
            return {
              ...org,
              users: orgUsers.map(user => ({
                ...user,
                user_email: user.user.email
              }))
            }
          }
          return org
        })
      )
    } catch (error) {
      console.error('Error al obtener usuarios de la organización:', error)
    }
  }

  async function createOrganization(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('organizations')
        .insert([{ name: newOrgName }])

      if (error) throw error
      setNewOrgName('')
      fetchOrganizations()
    } catch (error) {
      console.error('Error al crear organización:', error)
    }
  }

  async function deleteOrganization(orgId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta organización?')) {
      return
    }

    setDeleteLoading(orgId)
    try {
      const { error: usersError } = await supabase
        .from('organization_users')
        .delete()
        .eq('organization_id', orgId)

      if (usersError) throw usersError

      const { error: orgError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId)

      if (orgError) throw orgError

      setOrganizations(organizations.filter(org => org.id !== orgId))
    } catch (error) {
      console.error('Error al eliminar la organización:', error)
      alert('Error al eliminar la organización')
    } finally {
      setDeleteLoading(null)
    }
  }

  const toggleOrganization = async (orgId: string) => {
    const newExpandedOrgs = new Set(expandedOrgs)
    if (expandedOrgs.has(orgId)) {
      newExpandedOrgs.delete(orgId)
    } else {
      newExpandedOrgs.add(orgId)
      if (!organizations.find(org => org.id === orgId)?.users) {
        await fetchOrganizationUsers(orgId)
      }
    }
    setExpandedOrgs(newExpandedOrgs)
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Desarrollador</h1>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Crear Nueva Organización</h2>
          <form onSubmit={createOrganization} className="flex gap-4">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Nombre de la Organización"
              className="flex-1 px-4 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Crear
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">Organizaciones</h2>
          <div className="divide-y">
            {organizations.map((org) => (
              <div key={org.id} className="flex flex-col">
                <div className="p-6 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleOrganization(org.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedOrgs.has(org.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="text-lg font-medium">{org.name}</h3>
                        <p className="text-sm text-gray-500">
                          Creada: {new Date(org.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOrganization(org.id)}
                    disabled={deleteLoading === org.id}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Eliminar organización"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {expandedOrgs.has(org.id) && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-gray-500" />
                        <h4 className="font-medium">Usuarios de la Organización</h4>
                      </div>
                      {org.users ? (
                        org.users.length > 0 ? (
                          <div className="space-y-3">
                            {org.users.map((user) => (
                              <div
                                key={user.id}
                                className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
                              >
                                <div>
                                  <p className="font-medium">{user.user_email}</p>
                                  <p className="text-sm text-gray-500 capitalize">
                                    Rol: {user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-2">
                            No hay usuarios en esta organización
                          </p>
                        )
                      ) : (
                        <div className="text-center py-2">
                          <div className="animate-pulse">Cargando usuarios...</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {organizations.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No se encontraron organizaciones
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
