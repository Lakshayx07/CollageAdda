"use client";
import React, { useState } from "react";
import { Compass, ShoppingBag, Briefcase, Plus, Filter, MessageSquare, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function HustleHubPage() {
  const [activeTab, setActiveTab] = useState("thrift"); // 'thrift' or 'gigs'
  const [thriftItems, setThriftItems] = useState([]);
  const [gigItems, setGigItems] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);

  // Form Fields
  const [listingType, setListingType] = useState("thrift"); // 'thrift' or 'gig'
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Like New"); // for thrift
  const [gigType, setGigType] = useState("Tech"); // for gig
  const [imagePreview, setImagePreview] = useState("");
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const handlePost = (e) => {
    e.preventDefault();

    if (listingType === "thrift") {
      if (!title.trim() || !price.trim() || !condition || !imagePreview || !comment.trim()) {
        alert("Please fill in all columns (Item name, Price, Condition, Photo, and Comment) to create your public listing.");
        return;
      }
      const newItem = {
        id: Date.now(),
        title,
        price: price.startsWith("₹") ? price : `₹${price}`,
        condition,
        comment,
        seller: "Lakshay Y.",
        college: "Rishihood",
        image: imagePreview,
      };
      setThriftItems([newItem, ...thriftItems]);
      setActiveTab("thrift");
    } else {
      if (!title.trim() || !price.trim() || !gigType || !comment.trim()) {
        alert("Please fill in all columns (Gig Title, Price, Category, and Comment) to publish your gig.");
        return;
      }
      const newGig = {
        id: Date.now(),
        title,
        price: price.startsWith("₹") ? price : `₹${price}`,
        type: gigType,
        comment,
        seller: "Lakshay Y.",
        rating: 5.0,
        jobs: 0,
      };
      setGigItems([newGig, ...gigItems]);
      setActiveTab("gigs");
    }

    // Reset Form & Close
    setTitle("");
    setPrice("");
    setCondition("Like New");
    setGigType("Tech");
    setImagePreview("");
    setComment("");
    setShowPostModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508] relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center mb-2">
            <Compass className="mr-3 text-emerald-400" size={32} /> 
            Hustle Hub<span className="text-emerald-500">.</span>
          </h1>
          <p className="text-white/50 text-sm font-medium max-w-md">
            The hyper-local campus marketplace. Buy/sell thrift items or offer your skills for quick cash.
          </p>
        </div>
        <button 
          onClick={() => {
            setListingType(activeTab === "thrift" ? "thrift" : "gig");
            setShowPostModal(true);
          }}
          className="mt-4 md:mt-0 bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center hover:scale-105 transition shadow-lg shadow-white/10"
        >
          <Plus size={16} className="mr-2" /> Post Listing
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 flex space-x-2 border-b border-white/5 relative z-10">
        <button 
          onClick={() => setActiveTab("thrift")}
          className={clsx(
            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center",
            activeTab === "thrift" ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
          )}
        >
          <ShoppingBag size={14} className="mr-2" /> Thrift Store
        </button>
        <button 
          onClick={() => setActiveTab("gigs")}
          className={clsx(
            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center",
            activeTab === "gigs" ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
          )}
        >
          <Briefcase size={14} className="mr-2" /> Student Gigs
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        {activeTab === "thrift" ? (
          thriftItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thriftItems.map(item => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedItem(item)}
                  className="bg-[#0A0A0F] border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition cursor-pointer"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white font-black text-sm">
                      {item.price}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{item.condition}</span>
                    <h3 className="text-white font-bold text-lg mt-3 leading-tight">{item.title}</h3>
                    <div className="flex items-center justify-between mt-4 text-xs text-white/40">
                      <span className="flex items-center"><div className="w-4 h-4 rounded-full bg-white/20 mr-2" /> {item.seller} • {item.college}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      className="w-full mt-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition flex items-center justify-center"
                    >
                      Message Seller <MessageSquare size={14} className="ml-2" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/30 pt-20">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <h3 className="font-bold text-lg mb-1">No items for sale</h3>
              <p className="text-xs">Be the first to list an item!</p>
            </div>
          )
        ) : (
          gigItems.length > 0 ? (
            <div className="space-y-4 max-w-3xl">
              {gigItems.map(gig => (
                <motion.div 
                  key={gig.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedItem(gig)}
                  className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-white/20 transition cursor-pointer shadow-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{gig.type}</span>
                      <span className="text-xs text-white/40 font-bold flex items-center">⭐ {gig.rating} ({gig.jobs} completed)</span>
                    </div>
                    <h3 className="text-white font-black text-lg mb-1">{gig.title}</h3>
                    <p className="text-sm text-white/50">Offered by {gig.seller}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end sm:ml-6 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                    <span className="text-2xl font-black text-white">{gig.price}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(gig); }}
                      className="mt-3 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center"
                    >
                      Hire <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/30 pt-20">
              <Briefcase size={48} className="mb-4 opacity-20" />
              <h3 className="font-bold text-lg mb-1">No gigs posted</h3>
              <p className="text-xs">Post a gig and start hustling.</p>
            </div>
          )
        )}
      </div>

      {/* Post Modal Form */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0A0F] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-black uppercase tracking-widest text-sm text-white flex items-center">
                  <Plus size={16} className="mr-2 text-emerald-400" /> Create New Listing
                </h3>
                <button onClick={() => setShowPostModal(false)} className="text-white/50 hover:text-white"><X size={18}/></button>
              </div>

              <form onSubmit={handlePost} className="p-6 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Listing Category</label>
                  <div className="flex space-x-2 bg-black p-1 rounded-xl border border-white/10">
                    <button 
                      type="button"
                      onClick={() => setListingType("thrift")}
                      className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", listingType === "thrift" ? "bg-emerald-500 text-black font-black" : "text-white/50 hover:text-white")}
                    >
                      Thrift Item
                    </button>
                    <button 
                      type="button"
                      onClick={() => setListingType("gig")}
                      className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", listingType === "gig" ? "bg-emerald-500 text-black font-black" : "text-white/50 hover:text-white")}
                    >
                      Student Gig
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">
                    {listingType === "thrift" ? "Item Name" : "Gig Title (e.g. I will do...)"}
                  </label>
                  <input 
                    type="text" 
                    placeholder={listingType === "thrift" ? "Engineering Drafter, Scientific Calculator..." : "I will review your code / design UI / edit videos..."}
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition" 
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Price (INR)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ₹500 or ₹200/hr"
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition" 
                  />
                </div>

                {/* Category specific fields */}
                {listingType === "thrift" ? (
                  <>
                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Condition</label>
                      <select 
                        value={condition} 
                        onChange={e => setCondition(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition appearance-none"
                      >
                        <option>Brand New</option>
                        <option>Like New</option>
                        <option>Good</option>
                        <option>Fair</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Comment / Description</label>
                      <textarea 
                        placeholder="Tell us about your product (e.g., age, defects, reason for selling)..."
                        value={comment} 
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition resize-none"
                      />
                    </div>

                    {/* Add Photo option */}
                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Item Photo</label>
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
                        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-white/[0.02] cursor-pointer transition"
                      >
                        {imagePreview ? (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                            <img src={imagePreview} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImagePreview(""); }} 
                              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black/80 text-white z-10"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="text-white/40 mb-2" size={24} />
                            <span className="text-xs text-white/60 font-bold uppercase tracking-wider">Upload Item Photo</span>
                            <span className="text-[10px] text-white/30 mt-1">PNG, JPG up to 5MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Gig Category</label>
                      <select 
                        value={gigType} 
                        onChange={e => setGigType(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition appearance-none"
                      >
                        <option>Tech</option>
                        <option>Creative</option>
                        <option>Skill</option>
                        <option>Academic</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-2">Comment / Description</label>
                      <textarea 
                        placeholder="Describe the service or skills you offer..."
                        value={comment} 
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition resize-none"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0A0F] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-black uppercase tracking-widest text-xs text-white/60">
                  {selectedItem.condition ? "Thrift Item Details" : "Student Gig Details"}
                </h3>
                <button onClick={() => setSelectedItem(null)} className="text-white/50 hover:text-white"><X size={18}/></button>
              </div>

              <div className="overflow-y-auto max-h-[85vh]">
                {selectedItem.image && (
                  <div className="h-56 overflow-hidden relative border-b border-white/10 bg-black">
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
                    <h2 className="text-xl font-black text-white leading-tight">{selectedItem.title}</h2>
                    <p className="text-2xl font-black text-emerald-400 mt-2">{selectedItem.price}</p>
                  </div>

                  {selectedItem.comment && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <h4 className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Comment / Product Details</h4>
                      <p className="text-sm text-white/80 leading-relaxed font-medium">{selectedItem.comment}</p>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between text-xs text-white/40 border-t border-white/5">
                    <span className="flex items-center"><div className="w-4 h-4 rounded-full bg-white/20 mr-2" /> {selectedItem.seller}</span>
                    {selectedItem.college && <span>{selectedItem.college}</span>}
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedItem(null);
                      alert(`Contacting ${selectedItem.seller} regarding "${selectedItem.title}"`);
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
