import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function ValidateRolePage() {
  const { user, setOrganizationRole } = useAuth()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkUserRole() {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        // Primero verificamos si es developer
        const { data: developerData, error: developerError } = await supabase
          .from('developer_users')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        if (developerError && developerError.code !== 'PGRST116') {
          console.error('Error al verificar developer:', developerError)
        }

        if (developerData) {
          setOrganizationRole(null)
          navigate('/developer')
          return
        }

        // Si no es developer, verificamos organization_users
        const { data: orgUser, error: orgError } = await supabase
          .from('organization_users')
          .select('organization_id, role')
          .eq('user_id', user.id)
          .single()

        if (orgError && orgError.code !== 'PGRST116') {
          console.error('Error al verificar organization_users:', orgError)
        }

        if (orgUser) {
          setOrganizationRole({
            organization_id: orgUser.organization_id,
            role: orgUser.role
          })
          navigate(orgUser.role === 'admin' ? '/admin' : '/vendor')
        } else {
          setOrganizationRole(null)
          navigate('/unauthorized')
        }
      } catch (error) {
        console.error('Error al validar rol:', error)
        setOrganizationRole(null)
        navigate('/unauthorized')
      } finally {
        setIsChecking(false)
      }
    }

    checkUserRole()
  }, [user, navigate, setOrganizationRole])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Verificando permisos...</h2>
          <p className="text-gray-600">Por favor espere</p>
        </div>
      </div>
    )
  }

  return null
}
