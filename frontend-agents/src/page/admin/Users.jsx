import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import RequestAPIApp from "../../lib/request"
import { useAuthorization } from "../../components/content/Authentication"
import { Pencil, Trash2, Plus, Users, UserPlus, Shield, CheckCircle2, XCircle } from "lucide-react"
import Button from "../../components/meta/Button"
import Input from "../../components/meta/Input"
import HeadOperation from "../../components/content/HeadOperation"

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const auth = useAuthorization()

  const loadUsers = useCallback(async () => {
    try {
      const response = await RequestAPIApp("/admin/users", {
        headers: auth.headers()
      })
      if (response.data?.status === "success" && response.data?.data?.users) {
        setUsers(response.data.data.users)
      }
    } catch (error) {
      toast.error("Gagal memuat data pengguna")
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  async function handleSubmit(e) {
    e.preventDefault()
    if (isSubmitting) return

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    setIsSubmitting(true)
    try {
      let response;
      if (selectedUser) {
        response = await RequestAPIApp(`/admin/users/${selectedUser.id}`, {
          method: "PUT",
          data
        })
      } else {
        response = await RequestAPIApp("/admin/users", {
          method: "POST",
          data
        })
      }

      if (!response.isError) {
        toast.success(selectedUser ? "Data pengguna diperbarui" : "Pengguna baru ditambahkan")
        loadUsers()
        setIsModalOpen(false)
      }
    } catch (error) {
      toast.error("Gagal memproses data")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteUser(id) {
    if (isSubmitting) return
    if (!window.confirm("Hapus pengguna ini secara permanen?")) return

    setIsSubmitting(true)
    try {
      const response = await RequestAPIApp(`/admin/users/${id}`, {
        method: "DELETE"
      })
      if (!response.isError) {
        toast.success("Pengguna dihapus")
        loadUsers()
      }
    } catch (error) {
      toast.error("Gagal menghapus pengguna")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ba-shiroko-palette-medium" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <HeadOperation title="AZStore Admin - Users" />
      
      <div className="w-full mb-8">
        <div className="ba-headers-title-text flex items-center justify-between px-4 rounded-t-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-ba-shiroko-palette-medium" />
            <h1 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter uppercase">Operations: Agent Control</h1>
          </div>
          <Button
            onClick={() => {
              if (isSubmitting) return
              setSelectedUser(null)
              setIsModalOpen(true)
            }}
            className="h-[32px] min-w-[100px] py-0 text-[10px] font-black"
            disabled={isSubmitting}
          >
            <UserPlus size={14} className="mr-1" /> ADD NEW AGENT
          </Button>
        </div>
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-lg ba-headers-content-bg shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Control terminal akses untuk seluruh agen di distrik AZStore.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-tighter border-b border-neutral-100 text-left">
                <th className="p-4">Agent Identity</th>
                <th className="p-4">Mission Frequency</th>
                <th className="p-4">Role</th>
                <th className="p-4">Clearance</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-black text-ba-shiroko-palette-dark-3 uppercase">{user.name}</span>
                      <span className="text-[10px] text-neutral-400 font-bold">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-ba-shiroko-palette-medium">{user.phone_number || 'N/A'}</span>
                      <span className="text-[9px] text-neutral-400 uppercase truncate max-w-[150px]">{user.address || '-'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      user.role === 'admin' ? "bg-ba-shiroko-palette-medium text-white" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {user.is_active ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <XCircle size={14} className="text-rose-500" />
                      )}
                      <span className={`text-[10px] font-black uppercase ${user.is_active ? "text-emerald-600" : "text-rose-600"}`}>
                        {user.is_active ? "Authorized" : "Locked"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          if (isSubmitting) return
                          setSelectedUser(user)
                          setIsModalOpen(true)
                        }}
                        disabled={isSubmitting}
                        className="p-2 text-ba-shiroko-palette-medium hover:bg-ba-shiroko-palette-light/10 rounded transition-colors disabled:opacity-30"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isSubmitting}
                        className="p-2 text-rose-400 hover:bg-rose-50 rounded transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ba-shiroko-palette-dark/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="ba-headers-title-text flex items-center px-4 h-12">
              <Shield className="w-4 h-4 mr-2 text-ba-shiroko-palette-medium" />
              <h2 className="font-black text-ba-shiroko-palette-dark-2 tracking-tighter text-sm uppercase">
                {selectedUser ? "Modify Agent Data" : "Register New Agent"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 ba-headers-content-bg">
              <div>
                <p className="text-[10px] font-black text-neutral-400 mb-1 uppercase">Full Name</p>
                <Input name="name" defaultValue={selectedUser?.name} required placeholder="Agent Name" disabled={isSubmitting} />
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 mb-1 uppercase">Email Address</p>
                <Input type="email" name="email" defaultValue={selectedUser?.email} required placeholder="agent@terminal.net" disabled={isSubmitting} />
              </div>
              {!selectedUser && (
                <div>
                  <p className="text-[10px] font-black text-neutral-400 mb-1 uppercase">Password</p>
                  <Input type="password" name="password" required placeholder="••••••••" disabled={isSubmitting} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 mb-1 uppercase">Role</p>
                  <select 
                    name="role" 
                    defaultValue={selectedUser?.role || "agent"} 
                    disabled={isSubmitting}
                    className="w-full text-xs font-bold p-2 border border-ba-input-border rounded bg-ba-input-bg text-ba-input-text outline-none focus:ring-1 focus:ring-ba-shiroko-palette-medium transition-all disabled:opacity-50"
                  >
                    <option value="agent">AGENT</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-400 mb-1 uppercase">Clearance</p>
                  <select 
                    name="is_active" 
                    defaultValue={selectedUser?.is_active ? "1" : "0"} 
                    disabled={isSubmitting}
                    className="w-full text-xs font-bold p-2 border border-ba-input-border rounded bg-ba-input-bg text-ba-input-text outline-none focus:ring-1 focus:ring-ba-shiroko-palette-medium transition-all disabled:opacity-50"
                  >
                    <option value="1">AUTHORIZED</option>
                    <option value="0">LOCKED</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 mb-1 uppercase">Phone Number</p>
                <Input type="tel" name="phone_number" defaultValue={selectedUser?.phone_number} required placeholder="08XXXXXXXXXX" disabled={isSubmitting} />
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 mb-1 uppercase">Base Address</p>
                <textarea 
                  name="address" 
                  defaultValue={selectedUser?.address} 
                  required 
                  disabled={isSubmitting}
                  className="w-full text-xs font-bold p-2 border border-ba-input-border rounded bg-ba-input-bg text-ba-input-text outline-none focus:ring-1 focus:ring-ba-shiroko-palette-medium transition-all disabled:opacity-50" 
                  rows="2" 
                  placeholder="Abydos District..." 
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-md bg-neutral-100 text-neutral-500 font-black text-[10px] uppercase hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  CANCEL
                </button>
                <Button 
                  type="submit" 
                  className="flex-[2] py-2 h-auto text-[10px] font-black uppercase" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "PROCESSING..." : (selectedUser ? "SAVE CHANGES" : "AUTHORIZE AGENT")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
