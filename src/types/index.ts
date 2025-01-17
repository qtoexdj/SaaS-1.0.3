export interface Profile {
  id: string
  user_id: string
  created_at: string
}

export interface DeveloperUser {
  user_id: string
}

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface OrganizationUser {
  id: string
  organization_id: string
  user_id: string
  role: 'admin' | 'vendor'
  created_at: string
  flow_id?: string
}

export interface OrganizationRole {
  organization_id: string
  role: 'admin' | 'vendor'
}

export interface AuthContextType {
  user: any
  loading: boolean
  signOut: () => Promise<void>
  organizationRole: OrganizationRole | null
  setOrganizationRole: (role: OrganizationRole | null) => void
}
