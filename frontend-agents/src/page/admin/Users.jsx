import { useEffect, useState } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../../lib/request"
import { useAuthorization } from "../../components/content/Authentication"
import { Pencil, Trash2, Plus } from "lucide-react"
import Button from "../../components/meta/Button"

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const auth = useAuthorization()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const response = await RequestAPIApp("/admin/users", {
        headers: auth.headers()
      })
      if (response.data?.data?.users) {
        setUsers(response.data.data.users)
      }
    } catch (error) {
      toast.error("Failed to load users", {
        description: "Please try again later"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateUser(data) {
    try {
      await RequestAPIApp.post("/admin/users", data, {
        headers: auth.headers()
      })
      toast.success("User created successfully")
      loadUsers()
      setIsModalOpen(false)
    } catch (error) {
      toast.error("Failed to create user", {
        description: error.response?.data?.message || "Please try again later"
      })
    }
  }

  async function handleUpdateUser(id, data) {
    try {
      await RequestAPIApp.put(`/admin/users/${id}`, data, {
        headers: auth.headers()
      })
      toast.success("User updated successfully")
      loadUsers()
      setIsModalOpen(false)
    } catch (error) {
      toast.error("Failed to update user", {
        description: error.response?.data?.message || "Please try again later"
      })
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      await RequestAPIApp.delete(`/admin/users/${id}`, {
        headers: auth.headers()
      })
      toast.success("User deleted successfully")
      loadUsers()
    } catch (error) {
      toast.error("Failed to delete user", {
        description: error.response?.data?.message || "Please try again later"
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button
          onClick={() => {
            setSelectedUser(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.status === "active" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedUser ? "Edit User" : "Add New User"}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const data = Object.fromEntries(formData)
              
              if (selectedUser) {
                handleUpdateUser(selectedUser.id, data)
              } else {
                handleCreateUser(data)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedUser?.name}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser?.email}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                {!selectedUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue={selectedUser?.role || "user"}
                    className="w-full p-2 border rounded"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedUser?.status || "active"}
                    className="w-full p-2 border rounded"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedUser ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
