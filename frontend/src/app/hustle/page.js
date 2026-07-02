"use client";
import React, { useState, useEffect } from "react";
import { Compass, ShoppingBag, Briefcase, Plus, Filter, MessageSquare, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApiQuery } from "../../utils/useApiQuery";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function HustleHubPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("thrift"); // 'thrift' or 'gigs'
  const [showPostModal, setShowPostModal] = useState(false);

  // Form Fields
  const [listingType, setListingType] = useState("thrift"); // 'thrift' or 'gig'
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Like New"); // for thrift
  const [gigType, setGigType] = useState("Tech"); // for gig (legacy)
  const [roleNeeded, setRoleNeeded] = useState(""); // structured gig field
  const [projectType, setProjectType] = useState("Hackathon"); // structured gig field
  const [compensation, setCompensation] = useState(""); // structured gig field
  const [imagePreview, setImagePreview] = useState("");
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Load logged-in user
    const storedUser = localStorage.getItem("collegeadda_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // -- TanStack Query: Hustle listings --
  const { data: allListings = [] } = useApiQuery(
    "hustle-listings",
    "/api/hustle",
    {
      staleTime: 2 * 60 * 1000,
    }
  );

  const thriftItems = allListings.filter(item => item.type === 'thrift');
  const gigItems = allListings.filter(item => item.type === 'gig');

  const handlePost = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("collegeadda_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    if (listingType === "thrift") {
      if (!title.trim() || !price.trim() || !condition || !imagePreview || !comment.trim()) {
        alert("Please fill in all columns (Item name, Price, Condition, Photo, and Comment) to create your public listing.");
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/hustle`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            price: price.startsWith("₹") ? price : `₹${price}`,
            condition,
            type: "thrift",
            comment,
            image: imagePreview
          })
        });
        if (res.ok) {
          const newListing = await res.json();
          queryClient.setQueryData(["hustle-listings"], (prev) => [newListing, ...(prev || [])]);
          setActiveTab("thrift");
        } else {
          alert("Failed to save listing to server.");
        }
      } catch (error) {
        console.error(error);
        alert("Error saving listing.");
      }
    } else {
      if (!title.trim() || !price.trim() || !roleNeeded.trim() || !projectType || !comment.trim()) {
        alert("Please fill in all gig fields: Role Needed, Project Type, and Description.");
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/hustle`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            price: price.startsWith("₹") ? price : `₹${price}`,
            gigType,
            type: "gig",
            roleNeeded,
            projectType,
            compensation,
            comment
          })
        });
        if (res.ok) {
          const newListing = await res.json();
          queryClient.setQueryData(["hustle-listings"], (prev) => [newListing, ...(prev || [])]);
          setActiveTab("gigs");
        } else {
          alert("Failed to save gig to server.");
        }
      } catch (error) {
        console.error(error);
        alert("Error saving gig.");
      }
    }

    // Reset Form & Close
    setTitle("");
    setPrice("");
    setCondition("Like New");
    setGigType("Tech");
    setRoleNeeded("");
    setProjectType("Hackathon");
    setCompensation("");
    setImagePreview("");
    setComment("");
    setShowPostModal(false);
  };

  const handleMessageSeller = (listing) => {
    const sellerId = listing.seller?._id || listing.seller?.id || listing.seller;
    if (!sellerId) {
      alert("Cannot message seller: seller profile not found.");
      return;
    }
    if (currentUser && (sellerId === currentUser._id || sellerId === currentUser.id)) {
      alert("You cannot chat with yourself.");
      return;
    }
    router.push(`/messages?userId=${sellerId}&interestProduct=${encodeURIComponent(listing.title)}`);
  };

  return (
    <div className="page-shell flex flex-col overflow-hidden">
      <header className="page-header sticky top-0 z-40 px-5 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight flex items-center mb-2">
              <Compass className="mr-3 text-emerald-400" size={32} />
              Hustle Hub<span className="text-emerald-500">.</span>
            </h1>
            <p className="text-muted text-sm font-medium max-w-md">
              Campus marketplace for thrift finds, used books, services, and student gigs.
            </p>
          </div>
          <button
            onClick={() => {
              setListingType(activeTab === "thrift" ? "thrift" : "gig");
              setShowPostModal(true);
            }}
            className="primary-button flex w-full items-center justify-center rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest transition hover:scale-[1.03] sm:w-auto"
          >
            <Plus size={16} className="mr-2" /> Post Listing
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="no-scrollbar relative z-10 mx-auto flex w-full max-w-6xl space-x-2 overflow-x-auto px-5 py-4">
        <button
          onClick={() => setActiveTab("thrift")}
          className={clsx(
            "flex shrink-0 items-center rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition sm:px-6",
            activeTab === "thrift" ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-[#F3F2EE] text-[#6B6B6B] hover:bg-[#F3F2EE] hover:text-[#1A1A1A]"
          )}
        >
          <ShoppingBag size={14} className="mr-2" /> Thrift Store
        </button>
        <button
          onClick={() => setActiveTab("gigs")}
          className={clsx(
            "flex shrink-0 items-center rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition sm:px-6",
            activeTab === "gigs" ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-[#F3F2EE] text-[#6B6B6B] hover:bg-[#F3F2EE] hover:text-[#1A1A1A]"
          )}
        >
          <Briefcase size={14} className="mr-2" /> Student Gigs
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-5 pb-8 relative z-10">
        {activeTab === "thrift" ? (
          thriftItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thriftItems.map(item => (
                <motion.div
                  key={item._id || item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedItem(item)}
                  className="ca-card overflow-hidden group transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-[#F3F2EE] flex items-center justify-center">
                          <ShoppingBag className="text-[#888888]" size={32} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#E8E6E0] text-[#1A1A1A] font-black text-sm">
                        {item.price}
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="inline-block text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{item.condition}</span>
                      <h3 className="text-[#1A1A1A] font-bold text-lg leading-tight">{item.title}</h3>
                      {item.comment && (
                        <p className="text-[#6B6B6B] text-xs line-clamp-2 italic font-medium">"{item.comment}"</p>
                      )}
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between mt-2 mb-4 text-xs text-[#6B6B6B]">
                      <span className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#F3F2EE] mr-2" />
                        <span className="flex min-w-0 items-center">
                          {item.seller?.name || item.seller || "Lakshay Y."}
                          <VerifiedBadge user={item.seller} size={13} />
                        </span>
                        <span className="mx-1">•</span>
                        {item.seller?.university || item.college || "Rishihood"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMessageSeller(item); }}
                      className="ca-btn-primary w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center"
                    >
                      Message Seller <MessageSquare size={14} className="ml-2" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="app-panel mx-auto flex min-h-[360px] max-w-xl flex-col items-center justify-center rounded-[1.75rem] p-8 text-center">
              <ShoppingBag size={42} className="mb-4 text-emerald-300" />
              <h3 className="text-xl font-black text-[#1A1A1A] mb-1">No thrift listings yet</h3>
              <p className="text-sm text-muted">Listings will appear here by newest campus activity.</p>
            </div>
          )
        ) : (
          gigItems.length > 0 ? (
            <div className="space-y-4 max-w-3xl">
              {gigItems.map(gig => (
                <motion.div
                  key={gig._id || gig.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedItem(gig)}
                  className="ca-card flex flex-col sm:flex-row sm:items-center justify-between group transition cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {gig.projectType || gig.gigType || gig.type}
                      </span>
                      {gig.roleNeeded && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          👤 {gig.roleNeeded}
                        </span>
                      )}
                      {gig.compensation && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                          💰 {gig.compensation}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[#1A1A1A] font-black text-lg mb-1">{gig.title}</h3>
                    {gig.comment && (
                      <p className="text-[#6B6B6B] text-xs mb-3 line-clamp-2 italic font-medium">"{gig.comment}"</p>
                    )}
                    <p className="text-xs text-[#6B6B6B]">Offered by <span className="text-[#4A4A4A] font-bold">{gig.seller?.name || gig.seller || "Lakshay Y."}</span> • {gig.seller?.university || "Rishihood"}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end sm:ml-6 border-t sm:border-t-0 sm:border-l border-[#E8E6E0] pt-4 sm:pt-0 sm:pl-6">
                    <span className="text-2xl font-black text-[#1A1A1A]">{gig.price}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMessageSeller(gig); }}
                      className="ca-btn-primary mt-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center"
                    >
                      Hire <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="app-panel mx-auto flex min-h-[360px] max-w-xl flex-col items-center justify-center rounded-[1.75rem] p-8 text-center">
              <Briefcase size={42} className="mb-4 text-emerald-300" />
              <h3 className="text-xl font-black text-[#1A1A1A] mb-1">No gigs posted yet</h3>
              <p className="text-sm text-muted">Student services and quick jobs will appear here.</p>
            </div>
          )
        )}
      </main>

      {/* Post Modal Form */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="app-panel rounded-[1.75rem] w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-[#E8E6E0] flex justify-between items-center bg-[#F3F2EE]">
                <h3 className="font-black uppercase tracking-widest text-sm text-[#1A1A1A] flex items-center">
                  <Plus size={16} className="mr-2 text-emerald-400" /> Create New Listing
                </h3>
                <button onClick={() => setShowPostModal(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]"><X size={18}/></button>
              </div>

              <form onSubmit={handlePost} className="p-6 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Listing Category</label>
                  <div className="flex space-x-2 bg-[#F3F2EE] p-1 rounded-xl border border-[#E8E6E0]">
                    <button
                      type="button"
                      onClick={() => setListingType("thrift")}
                      className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", listingType === "thrift" ? "bg-emerald-500 text-black font-black" : "text-[#6B6B6B] hover:text-[#1A1A1A]")}
                    >
                      Thrift Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setListingType("gig")}
                      className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", listingType === "gig" ? "bg-emerald-500 text-black font-black" : "text-[#6B6B6B] hover:text-[#1A1A1A]")}
                    >
                      Student Gig
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">
                    {listingType === "thrift" ? "Item Name" : "Gig Title (e.g. I will do...)"}
                  </label>
                  <input
                    type="text"
                    placeholder={listingType === "thrift" ? "Engineering Drafter, Scientific Calculator..." : "I will review your code / design UI / edit videos..."}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Price (INR)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹500 or ₹200/hr"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* Category specific fields */}
                {listingType === "thrift" ? (
                  <>
                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Condition</label>
                      <select
                        value={condition}
                        onChange={e => setCondition(e.target.value)}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition appearance-none"
                      >
                        <option>Brand New</option>
                        <option>Like New</option>
                        <option>Good</option>
                        <option>Fair</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Comment / Description</label>
                      <textarea
                        placeholder="Tell us about your product (e.g., age, defects, reason for selling)..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition resize-none"
                      />
                    </div>

                    {/* Add Photo option */}
                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Item Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        id="item-photo-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="item-photo-upload"
                        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[#E8E6E0] rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-[#F3F2EE] cursor-pointer transition"
                      >
                        {imagePreview ? (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                            <img src={imagePreview} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImagePreview(""); }}
                              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black/40 text-[#1A1A1A] z-10"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="text-[#6B6B6B] mb-2" size={24} />
                            <span className="text-xs text-[#6B6B6B] font-bold uppercase tracking-wider">Upload Item Photo</span>
                            <span className="text-[10px] text-[#6B6B6B] mt-1">PNG, JPG up to 5MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Role Needed</label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Dev, Video Editor, Strategist..."
                        value={roleNeeded}
                        onChange={e => setRoleNeeded(e.target.value)}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Project Type</label>
                      <select
                        value={projectType}
                        onChange={e => setProjectType(e.target.value)}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition appearance-none"
                      >
                        <option>Hackathon</option>
                        <option>Startup</option>
                        <option>Freelance</option>
                        <option>Research</option>
                        <option>Side Project</option>
                        <option>Non-Profit</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Compensation / Equity / Learning</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹500/hr, 5% Equity, Portfolio + Learning"
                        value={compensation}
                        onChange={e => setCompensation(e.target.value)}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#6B6B6B] font-black uppercase tracking-widest block mb-2">Gig Description</label>
                      <textarea
                        placeholder="Describe your project and what the role involves..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:border-emerald-500 focus:outline-none transition resize-none"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Publish Listing 🚀
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Listing Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="app-panel rounded-[1.75rem] w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-[#E8E6E0] flex justify-between items-center bg-[#F3F2EE]">
                <h3 className="font-black uppercase tracking-widest text-xs text-[#6B6B6B]">
                  {selectedItem.condition ? "Thrift Item Details" : "Student Gig Details"}
                </h3>
                <button onClick={() => setSelectedItem(null)} className="text-[#6B6B6B] hover:text-[#1A1A1A]"><X size={18}/></button>
              </div>

              <div className="overflow-y-auto max-h-[85vh]">
                {selectedItem.image && (
                  <div className="h-56 overflow-hidden relative border-b border-[#E8E6E0] bg-black">
                    <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      {selectedItem.condition ? selectedItem.condition : selectedItem.type}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-[#1A1A1A] leading-tight">{selectedItem.title}</h2>
                    <p className="text-2xl font-black text-emerald-400 mt-2">{selectedItem.price}</p>
                  </div>

                  {selectedItem.comment && (
                    <div className="bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl p-4">
                      <h4 className="text-[9px] text-[#6B6B6B] font-black uppercase tracking-widest mb-1">Comment / Product Details</h4>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed font-medium">{selectedItem.comment}</p>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between text-xs text-[#6B6B6B] border-t border-[#E8E6E0]">
                    <span className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#F3F2EE] mr-2" />
                      {selectedItem.seller?.name || selectedItem.seller || "Lakshay Y."}
                    </span>
                    <span>{selectedItem.seller?.university || selectedItem.college || "Rishihood"}</span>
                  </div>

                  <button
                    onClick={() => {
                      const item = selectedItem;
                      setSelectedItem(null);
                      handleMessageSeller(item);
                    }}
                    className="w-full mt-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    Contact Seller <MessageSquare size={14} className="ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
