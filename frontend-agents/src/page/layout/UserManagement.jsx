import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuthorization } from "../../components/content/Authentication"
import RequestAPIApp from "../../lib/request"
import HeadOperation from "../content/HeadOperation"
import Button from "../../components/meta/Button"
import { User, Phone, MapPin, Wallet, Shield, Edit, Save, X } from "lucide-react"

export default function UserManagement() {
  const auth = useAuthorization()
  const [profile, setProfile] = useState({
    data: {},
    loading: true,
    editing: false
  })
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const response = await RequestAPIApp("/auth/me", {
        headers: auth.headers(),
        showErrorOnToast: false
      })
      
      if (response.data?.data?.user) {
        const userData = response.data.data.user
        setProfile({
          data: userData,
          loading: false,
          editing: false
        })
        setEditForm({
          name: userData.name,
          phone_number: userData.phone_number,
          address: userData.address
        })
      } else {
        // Fallback to local data
        const localUser = auth.getUser()
        setProfile({
          data: localUser,
          loading: false,
          editing: false
        })
        setEditForm({
          name: localUser.name,
          phone_number: localUser.phone_number,
          address: localUser.address
        })
      }
    } catch {
      toast.error("Failed to load profile", {
        description: "Please try again later"
      })
      setProfile(prev => ({ ...prev, loading: false }))
    }
  }

  async function handleUpdateProfile() {
    try {
      const response = await RequestAPIApp(`/admin/users/${profile.data.id}`, {
        method: "PUT",
        headers: auth.headers(),
        data: editForm
      })

      if (response.data?.status === 'success') {
        toast.success("Profile updated successfully")
        setProfile(prev => ({ ...prev, editing: false }))
        loadProfile() // Reload profile data
      }
    } catch (error) {
      toast.error("Failed to update profile", {
        description: error.response?.data?.message || "Please try again later"
      })
    }
  }

  function startEditing() {
    setProfile(prev => ({ ...prev, editing: true }))
  }

  function cancelEditing() {
    setEditForm({
      name: profile.data.name,
      phone_number: profile.data.phone_number,
      address: profile.data.address
    })
    setProfile(prev => ({ ...prev, editing: false }))
  }

  if (profile.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <>
      <HeadOperation title="AZStore - User Management" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage your account information and settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            {!profile.editing ? (
              <Button onClick={startEditing} className="flex items-center gap-2">
                <Edit size={16} />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleUpdateProfile} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Save size={16} />
                  Save Changes
                </Button>
                <Button onClick={cancelEditing} variant="outline" className="flex items-center gap-2">
                  <X size={16} />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                {profile.editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.data.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                {profile.editing ? (
                  <input
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900">{profile.data.phone_number || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Address
                </label>
                {profile.editing ? (
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900">{profile.data.address || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wallet size={16} className="inline mr-2" />
                  Account Balance
                </label>
                <p className="text-2xl font-bold text-green-600">
                  Rp {Number(profile.data.balance || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield size={16} className="inline mr-2" />
                  Account Status
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile.data.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile.data.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {profile.data.role === 'admin' ? 'Administrator' : 'Agent'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <p className="text-gray-900">
                  {profile.data.created_at 
                    ? new Date(profile.data.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = '/transaction/pulsa'}
              className="w-full p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <span className="text-lg">📱</span>
              <span>Buy Pulsa</span>
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/transaction/internet'}
              className="w-full p-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <span className="text-lg">📶</span>
              <span>Buy Data Package</span>
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/transaction/game'}
              className="w-full p-4 flex flex-col items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <span className="text-lg">🎮</span>
              <span>Buy Game Credits</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
