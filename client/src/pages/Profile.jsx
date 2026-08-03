import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import api from "../lib/api";
import { User, Activity, Calendar, Award, ShieldCheck, XCircle, Loader2 } from "lucide-react";


export default function Profile() {
  const { user, showToast } = useApp();
  
  const [bookings, setBookings] = useState([]);
  const [passes, setPasses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Sync transactional telemetry data upon component initialization
  useEffect(() => {
    async function fetchUserMetrics() {
      try {
        const [bookingsData, passesData] = await Promise.all([
          api.getMyBookings(),
          api.getMyPasses()
        ]);
        setBookings(bookingsData || []);
        setPasses(passesData || []);
      } catch (err) {
        console.error("Failed to compile athlete metrics:", err);
        showToast("METRIC TRANSCEIVER FAULT. REFRESH PORTAL.");
      } finally {
        setDataLoading(false);
      }
    }
    fetchUserMetrics();
  }, [showToast]);

  // Execute structural booking cancellation pipeline
  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      // Evict canceled records immediately from the active DOM state array
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      showToast("RESERVATION REVOKED SUCCESSFULLY.");
    } catch (err) {
      showToast(err.message || "TERMINATION FAULT ON CORE MODULE.");
    } finally {
      setCancellingId(null);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center text-zinc-500 gap-2">
        <Loader2 className="animate-spin text-[#CCFF00]" size={24} strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest">SYNCHRONIZING SECURE METRICS...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen pt-28 pb-16 px-4 md:px-8 selection:bg-emerald-400/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP LAYER: CORE ATHLETE SUMMARY NODE */}
        <div className="border-2 border-zinc-800 bg-zinc-950 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[6px_6px_0px_0px_rgba(204,255,0,0.15)] rounded-none">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-zinc-900 border-2 border-zinc-800 text-[#CCFF00]">
              <User size={28} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans font-black tracking-widest text-[8px] uppercase px-2 py-0.5">
                IDENTITY PROFILE PASSPORT
              </span>
              <h1 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tighter text-white">
                {user?.full_name || "ANONYMOUS_ATHLETE"}
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 font-mono">
                NET_ID // {user?.email}
              </p>
            </div>
          </div>
          
          {/* SECURE CLEARANCE NODE BAR */}
          <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-3 w-full md:w-auto justify-between">
            <div className="text-right">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">SECURITY RANK LAYER</p>
              <p className="text-xs font-black uppercase tracking-widest text-[#CCFF00]">{user?.role === "client" ? "ATHLETE NODE" : `${user?.role} NODE`}</p>
            </div>
            <ShieldCheck size={20} className="text-[#CCFF00]" strokeWidth={2.5} />
          </div>
        </div>

        {/* BOTTOM LAYER: DATA SECTORS MATRIX GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTOR 01: ACCOUNT LEDGER & ALLOCATED PASS PLANS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border-2 border-zinc-800 bg-zinc-950 p-6 space-y-4 rounded-none">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Award size={14} className="text-[#CCFF00]" strokeWidth={2.5} />
                <h3 className="text-xs font-black tracking-widest uppercase text-white">ACTIVE CLEARANCE ENTITLE-PASSES</h3>
              </div>
              
              {passes.length === 0 ? (
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 text-center">
                  <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">NO SUBSCRIPTION PASSPORTS SIGNED</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {passes.map((pass, index) => (
                    <div key={index} className="border border-zinc-800 bg-zinc-900 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-white tracking-wide">{pass.plan_name || "CREDIT PACKAGE"}</span>
                        <span className="text-[8px] font-black bg-[#CCFF00] text-black px-1.5 py-0.5 uppercase tracking-widest">ACTIVE</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                        <span>REMAINING SLOTS:</span>
                        <span className="text-white font-black">{pass.remaining_credits ?? "UNLIMITED"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTOR 02: CONFIRMED RESERVATIONS HUB SCHEDULE */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border-2 border-zinc-800 bg-zinc-950 p-6 rounded-none">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
                <Calendar size={14} className="text-[#CCFF00]" strokeWidth={2.5} />
                <h3 className="text-xs font-black tracking-widest uppercase text-white">RESERVED TRAINING ENGAGEMENTS ({bookings.length})</h3>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-zinc-900/30 border border-zinc-900 p-8 text-center flex flex-col items-center justify-center gap-2">
                  <Activity size={20} className="text-zinc-700" strokeWidth={2} />
                  <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">SCHEDULE DEVOID OF SESSIONS</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-white tracking-wide">{booking.class_title || "SESSION GROUP WORKOUT"}</span>
                          <span className="text-[7px] font-black px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 uppercase tracking-widest">
                            {booking.studio_name || "HQ STUDIO"}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                          TIMELOCK: {booking.start_time ? new Date(booking.start_time).toLocaleString() : "PENDING"}
                        </p>
                      </div>

                      <button
                        disabled={cancellingId === booking.id}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="sm:self-center inline-flex items-center justify-center gap-2 border border-red-900/40 bg-red-950/10 text-red-400 hover:bg-red-950/40 hover:border-red-500 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingId === booking.id ? (
                          <>
                            <Loader2 className="animate-spin" size={10} strokeWidth={3} />
                            REVOKING...
                          </>
                        ) : (
                          <>
                            <XCircle size={10} strokeWidth={2.5} />
                            ABORT SECTOR
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
