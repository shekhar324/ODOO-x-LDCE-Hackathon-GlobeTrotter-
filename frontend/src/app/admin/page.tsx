"use client";

import React, { useEffect, useState } from "react";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { IconUsers, IconSettings, IconShieldCheck, IconReceipt2, IconActivity } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For hackathon purposes, we just check if user is logged in
    // Real-world: check role === 'admin'
    
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, [supabase]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#e4e9dc] text-[#020202] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill />

        <div className="flex-1 max-w-[1400px] mx-auto w-full pt-40 pb-32 px-6 flex flex-col md:flex-row gap-10">
          
          {/* Admin Sidebar */}
          <aside className="w-full md:w-[250px] shrink-0 border-r border-[#0e0e0e]/20 pr-6 flex flex-col gap-2">
            <h3 className="font-serif text-2xl mb-6">Admin Panel</h3>
            
            <button className="flex items-center gap-3 px-4 py-3 bg-[#0e0e0e] text-white rounded-md text-sm transition-colors text-left">
              <IconUsers className="w-5 h-5" />
              Users & Profiles
            </button>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#0e0e0e]/5 text-[#0e0e0e]/70 hover:text-[#0e0e0e] rounded-md text-sm transition-colors text-left">
              <IconShieldCheck className="w-5 h-5" />
              Roles & Permissions
            </button>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#0e0e0e]/5 text-[#0e0e0e]/70 hover:text-[#0e0e0e] rounded-md text-sm transition-colors text-left">
              <IconReceipt2 className="w-5 h-5" />
              Billing
            </button>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#0e0e0e]/5 text-[#0e0e0e]/70 hover:text-[#0e0e0e] rounded-md text-sm transition-colors text-left">
              <IconActivity className="w-5 h-5" />
              API Logs
            </button>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#0e0e0e]/5 text-[#0e0e0e]/70 hover:text-[#0e0e0e] rounded-md text-sm transition-colors text-left mt-auto">
              <IconSettings className="w-5 h-5" />
              Global Settings
            </button>
          </aside>

          {/* Main Dashboard Content */}
          <main className="flex-1 flex flex-col gap-10">
            
            <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-[#0e0e0e] pb-10">
              <div>
                <EditorialHeading className="text-[53px] leading-none font-thin tracking-tight">User Management</EditorialHeading>
                <p className="font-sans text-[16px] text-[#020202]/70 mt-4 max-w-xl">
                  Manage registered GlobeTrotters, review accounts, and oversee platform activity.
                </p>
              </div>
              <div className="text-right">
                <span className="block text-4xl font-serif">{users.length}</span>
                <span className="font-sans text-xs uppercase tracking-widest text-[#0e0e0e]/70">Total Users</span>
              </div>
            </header>

            <div className="bg-white border border-[#0e0e0e] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0e0e0e]/20 bg-[#f5f7f2]">
                    <th className="py-4 px-6 font-sans text-xs uppercase tracking-widest text-[#0e0e0e]/70 font-normal">Name</th>
                    <th className="py-4 px-6 font-sans text-xs uppercase tracking-widest text-[#0e0e0e]/70 font-normal">Location</th>
                    <th className="py-4 px-6 font-sans text-xs uppercase tracking-widest text-[#0e0e0e]/70 font-normal">Joined</th>
                    <th className="py-4 px-6 font-sans text-xs uppercase tracking-widest text-[#0e0e0e]/70 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center font-sans text-sm text-[#0e0e0e]/50">Loading users...</td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((profile) => (
                      <tr key={profile.id} className="border-b border-[#0e0e0e]/10 hover:bg-[#f5f7f2] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0e0e0e] text-white flex items-center justify-center font-serif text-sm">
                              {profile.first_name?.[0] || profile.full_name?.[0] || "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">
                                {profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown"}
                              </span>
                              <span className="text-xs text-[#0e0e0e]/50">{profile.id.substring(0,8)}...</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-sans text-sm">
                          {profile.city || profile.country ? `${profile.city || ""}, ${profile.country || ""}` : "Not provided"}
                        </td>
                        <td className="py-4 px-6 font-sans text-sm">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => router.push("/profile")}
                            className="text-xs uppercase tracking-widest border border-[#0e0e0e] px-4 py-1 rounded-full hover:bg-[#0e0e0e] hover:text-white transition-colors cursor-pointer"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center font-sans text-sm text-[#0e0e0e]/50">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </main>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}
