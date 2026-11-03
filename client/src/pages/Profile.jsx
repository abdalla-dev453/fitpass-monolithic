import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import api from "../lib/api";
import { User, Activity, Calendar, Award, ShieldCheck, XCircle, Loader2, Star, Clock } from "lucide-react";

export default function Profile() {
  const { user, showToast } = useApp();
  
  const [bookings, setBookings] = useState([]);
  const [passes, setPasses] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [leavingWaitlistId, setLeavingWaitlistId] = useState(null);

  // Review modal state
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchUserMetrics = useCallback(async () => {
    try {
      const [bookingsData, passesData, waitlistData] = await Promise.all([
        api.getMyBookings().catch(() => []),
        api.getMyPasses().catch(() => []),
        api.getMyWaitlist().catch(() => []),
      ]);
      setBookings(bookingsData || []);
      setPasses(passesData || []);
      setWaitlist(waitlistData || []);
    } catch (err) {
      console.error("Failed to compile athlete metrics:", err);
      showToast("METRIC SYNCHRONIZATION FAULT. REFRESH PORTAL.");
    } finally {
      setDataLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUserMetrics();
  }, [fetchUserMetrics]);

  // Execute structural booking cancellation pipeline
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this class reservation? Any remaining credit will be refunded if the class hasn't started.")) {
      return;
    }
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      showToast("RESERVATION REVOKED. CREDIT RETURNED.");
      // Refresh passes to immediately update credit counter
      const updatedPasses = await api.getMyPasses().catch(() => null);
      if (updatedPasses) setPasses(updatedPasses);
    } catch (err) {
      showToast(err.message || "TERMINATION FAULT ON CORE MODULE.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleLeaveWaitlist = async (waitlistId) => {
    setLeavingWaitlistId(waitlistId);
    try {
      await api.leaveWaitlist(waitlistId);
      setWaitlist((prev) => prev.filter((w) => w.id !== waitlistId));
      showToast("REMOVED FROM WAITLIST.");
    } catch (err) {
      showToast(err.message || "FAILED TO LEAVE WAITLIST.");
    } finally {
      setLeavingWaitlistId(null);
    }
  };

  const handleOpenReview = (booking) => {
    setReviewBookingId(booking.id);
    setReviewRating(booking.rating || 5);
    setReviewText(booking.review_text || "");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBookingId) return;
    setSubmittingReview(true);
    try {
      await api.submitReview(reviewBookingId, {
        rating: Number(reviewRating),
        reviewText: reviewText.trim(),
      });
      showToast("REVIEW SUBMITTED. ATHLETE LOG UPDATED.");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewBookingId
            ? { ...b, rating: Number(reviewRating), review_text: reviewText.trim(), attended: true }
            : b
        )
      );
      setReviewBookingId(null);
    } catch (err) {
      showToast(err.message || "COULD NOT SUBMIT REVIEW.");
    } finally {
      setSubmittingReview(false);
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
    <div className="bg-[#0B0C10] text-white min-h-screen pt-28 pb-16 px-4 md:px-8 selection:bg-[#CCFF00] selection:text-black">
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
              <p className="text-[10px] font-medium lowercase tracking-wider text-zinc-400 font-mono">
                NET_ID // {user?.email}
              </p>
            </div>
          </div>
          
          {/* SECURE CLEARANCE NODE BAR */}
          <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-3 w-full md:w-auto justify-between">
            <div className="text-right">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">SECURITY RANK LAYER</p>
              <p className="text-xs font-black uppercase tracking-widest text-[#CCFF00]">
                {user?.role === "client" ? "ATHLETE NODE" : `${user?.role} NODE`}
              </p>
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
                <div className="bg-zinc-900/30 border border-zinc-900 p-6 text-center space-y-3">
                  <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">NO ACTIVE SUBSCRIPTION PASSPORTS</p>
                  <a
                    href="/pricing"
                    className="inline-block bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-black hover:bg-white transition-colors"
                  >
                    ACTIVATE PASS TIER →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {passes.map((pass, index) => (
                    <div key={index} className="border border-zinc-800 bg-zinc-900 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-white tracking-wide">{pass.plan_name || "CREDIT PACKAGE"}</span>
                        <span className="text-[8px] font-black bg-[#CCFF00] text-black px-2 py-0.5 uppercase tracking-widest">ACTIVE</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                        <span>REMAINING CREDITS:</span>
                        <span className="text-[#CCFF00] font-black text-sm">{pass.remaining_credits ?? "UNLIMITED"}</span>
                      </div>
                      {pass.expires_at && (
                        <p className="text-[8px] text-zinc-500 uppercase font-mono">
                          EXPIRES: {new Date(pass.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WAITLIST RADAR */}
            <div className="border-2 border-zinc-800 bg-zinc-950 p-6 space-y-4 rounded-none">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Clock size={14} className="text-amber-400" strokeWidth={2.5} />
                <h3 className="text-xs font-black tracking-widest uppercase text-white">
                  PRIORITY WAITLIST RADAR ({waitlist.length})
                </h3>
              </div>

              {waitlist.length === 0 ? (
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 text-center">
                  <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
                    NO CURRENT WAITLIST QUEUES
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitlist.map((item) => (
                    <div key={item.id} className="border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-white">{item.class_title}</span>
                        {item.notified_at ? (
                          <span className="text-[8px] font-black bg-amber-400 text-black px-1.5 py-0.5 uppercase tracking-widest animate-pulse">
                            SPOT OPEN!
                          </span>
                        ) : (
                          <span className="text-[8px] font-black bg-zinc-800 text-zinc-400 px-1.5 py-0.5 uppercase tracking-widest">
                            IN QUEUE
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase">
                        {item.studio_name} · {item.start_time ? new Date(item.start_time).toLocaleString() : ""}
                      </p>
                      <button
                        disabled={leavingWaitlistId === item.id}
                        onClick={() => handleLeaveWaitlist(item.id)}
                        className="text-[9px] font-black uppercase text-red-400 hover:text-white underline underline-offset-2"
                      >
                        {leavingWaitlistId === item.id ? "REMOVING..." : "LEAVE WAITLIST"}
                      </button>
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
                <h3 className="text-xs font-black tracking-widest uppercase text-white">
                  RESERVED TRAINING ENGAGEMENTS ({bookings.length})
                </h3>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-zinc-900/30 border border-zinc-900 p-8 text-center flex flex-col items-center justify-center gap-2">
                  <Activity size={20} className="text-zinc-700" strokeWidth={2} />
                  <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">SCHEDULE DEVOID OF SESSIONS</p>
                  <a
                    href="/classes"
                    className="mt-2 text-xs font-black text-[#CCFF00] hover:text-white underline uppercase tracking-widest"
                  >
                    DISCOVER ACTIVE CLASSES →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const isPast = booking.start_time && new Date(booking.start_time) < new Date();
                    return (
                      <div 
                        key={booking.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase text-white tracking-wide">
                              {booking.class_title || "SESSION GROUP WORKOUT"}
                            </span>
                            <span className="text-[7px] font-black px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 uppercase tracking-widest">
                              {booking.studio_name || "HQ STUDIO"}
                            </span>
                            {isPast && (
                              <span className="text-[7px] font-black px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700 text-zinc-500 uppercase tracking-widest">
                                COMPLETED
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                            TIMELOCK: {booking.start_time ? new Date(booking.start_time).toLocaleString() : "PENDING"}
                          </p>
                          {booking.rating && (
                            <div className="flex items-center gap-1 text-[#CCFF00] text-[10px] font-bold">
                              <Star size={10} fill="currentColor" />
                              <span>{booking.rating}/5</span>
                              {booking.review_text && (
                                <span className="text-zinc-400 italic font-sans font-normal ml-1">
                                  "{booking.review_text}"
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 sm:self-center">
                          {isPast && !booking.rating && (
                            <button
                              onClick={() => handleOpenReview(booking)}
                              className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 text-white hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
                            >
                              <Star size={10} />
                              RATE SESSION
                            </button>
                          )}

                          {!isPast && (
                            <button
                              disabled={cancellingId === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                              className="inline-flex items-center justify-center gap-2 border border-red-900/40 bg-red-950/10 text-red-400 hover:bg-red-950/40 hover:border-red-500 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId === booking.id ? (
                                <>
                                  <Loader2 className="animate-spin" size={10} strokeWidth={3} />
                                  REVOKING...
                                </>
                              ) : (
                                <>
                                  <XCircle size={10} strokeWidth={2.5} />
                                  ABORT RESERVATION
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RATING & REVIEW MODAL */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-lg uppercase text-white">
                RATE WORKOUT SESSION
              </h3>
              <button
                onClick={() => setReviewBookingId(null)}
                className="text-zinc-500 hover:text-white text-xs font-bold"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  RATING (1-5 STARS)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 border ${
                        reviewRating >= star
                          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500"
                      }`}
                    >
                      <Star size={16} fill={reviewRating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  WORKOUT DEBRIEF / FEEDBACK (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was the intensity, instructor guidance, and room atmosphere?"
                  className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-white uppercase focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 bg-[#CCFF00] text-black font-display font-black text-xs uppercase py-3 border border-black hover:bg-white transition-colors"
                >
                  {submittingReview ? "TRANSMITTING..." : "LOG OFFICIAL REVIEW"}
                </button>
                <button
                  type="button"
                  onClick={() => setReviewBookingId(null)}
                  className="border border-zinc-800 text-zinc-400 text-xs uppercase px-4 py-3 hover:text-white"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
