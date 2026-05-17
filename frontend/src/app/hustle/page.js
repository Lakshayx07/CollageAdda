"use client";
import React, { useState } from "react";
import { Compass, ShoppingBag, Briefcase, Plus, Filter, MessageSquare, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";


export default function HustleHubPage() {
  const [activeTab, setActiveTab] = useState("thrift"); // 'thrift' or 'gigs'
  
  // Real data will be fetched here
  const thriftItems = [];
  const gigItems = [];

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
        <button className="mt-4 md:mt-0 bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center hover:scale-105 transition shadow-lg shadow-white/10">
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
                    <button className="w-full mt-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition flex items-center justify-center">
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
                    <button className="mt-3 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center">
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
    </div>
  );
}
