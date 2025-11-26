'use client'

import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase' // We'll use supabase client directly for simplicity

// Define the type for a Client object
export type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
};

export default function Clients() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  
  // State for the new client form
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      fetchClients()
    }
  }, [user, loading, router])

  const fetchClients = async () => {
    if (!user) return;
    setFetchLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error.message)
    } else {
      setClients(data || [])
    }
    setFetchLoading(false)
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim() || !newEmail.trim()) {
        alert('Name and Email are required.');
        return;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({ 
        user_id: user.id, 
        name: newName, 
        email: newEmail, 
        phone: newPhone 
      })
      .select();

    if (error) {
      alert('Error creating client: ' + error.message)
    } else {
      // Add the new client to the top of the list
      setClients(prevClients => [data[0], ...prevClients]);
      // Clear the form
      setNewName('');
      setNewEmail('');
      setNewPhone('');
    }
  }

  if (loading || fetchLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading clients...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Client Management</h1>
        
        {/* Form to add a new client */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Client</h2>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Client
            </button>
          </form>
        </div>

        {/* List of existing clients */}
        <div className="space-y-4">
          {clients.length === 0 ? (
            <p>You haven&apos;t added any clients yet.</p>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{client.name}</h3>
                <p className="text-gray-600">{client.email}</p>
                {client.phone && <p className="text-gray-600">{client.phone}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
