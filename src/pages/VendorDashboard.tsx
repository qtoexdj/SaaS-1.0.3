import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Organization } from '../types'

export function VendorDashboard() {
  const { organizationRole, signOut } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organizationRole) {
      fetchOrganizationDetails()
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
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Vendedor</h1>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        {organization && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Detalles de la Organización</h2>
            <p className="text-gray-600">{organization.name}</p>
            <p className="text-sm text-gray-500">
              Creada: {new Date(organization.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
