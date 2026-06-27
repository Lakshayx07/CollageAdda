import React from "react";
import { User, Briefcase, GraduationCap, Code, Link, Clock } from "lucide-react";

export default function ApplicationCard({ application, onImpressive }) {
  if (!application) return null;

  // Assuming application has:
  // name, course_branch, year, role_applying, skills (text[]), why_join, linkedin_url, portfolio_url, status, 
  // profiles: { avatar_url }

  const profile = application.profiles || {};
  const skillsArray = Array.isArray(application.skills) ? application.skills : (application.skills ? application.skills.split(",") : []);

  return (
    <div className="bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl p-5 relative overflow-hidden transition-all hover:bg-[#F3F2EE] hover:border-[#E8E6E0] shadow-md">
      {/* Status badge */}
      {application.status === 'impressive' ? (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
          ✨ Impressive
        </div>
      ) : application.status === 'rejected' ? (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
          ✕ Rejected
        </div>
      ) : (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
          <Clock size={10} /> Pending
        </div>
      )}




      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left Col: Avatar + Name + applying for */}
        <div className="flex flex-col items-center min-w-[120px] shrink-0 text-center space-y-2">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={application.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8922A] to-[#D4A843] flex items-center justify-center text-xl font-black text-[#1A1A1A] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              {application.name?.charAt(0) || "?"}
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-black text-[#1A1A1A] leading-tight">{application.name}</h3>
            <div className="mt-2 bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
              {application.role_applying || "Member"}
            </div>
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="flex-1 w-full space-y-4">
          {/* Info Chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-[#F3F2EE] border border-[#E8E6E0] text-[#4A4A4A] px-2.5 py-1.5 rounded-xl text-[10px] font-bold">
              <GraduationCap size={12} className="text-[#6B6B6B]" />
              {application.course_branch}
            </div>
            <div className="flex items-center gap-1.5 bg-[#F3F2EE] border border-[#E8E6E0] text-[#4A4A4A] px-2.5 py-1.5 rounded-xl text-[10px] font-bold">
              <User size={12} className="text-[#6B6B6B]" />
              {application.year}
            </div>
          </div>

          {/* Skills */}
          {skillsArray.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6B6B6B] mb-1.5">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skillsArray.map((s, i) => (
                  <span key={i} className="text-[10px] font-bold text-[#1A1A1A] bg-[#F3F2EE] px-2 py-1 rounded-md">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {application.why_join && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6B6B6B] mb-1.5">Why I want to join</p>
              <div className="bg-black/30 border border-[#E8E6E0] rounded-xl p-3">
                <p className="text-xs text-[#4A4A4A] leading-relaxed italic">
                  "{application.why_join}"
                </p>
              </div>
            </div>
          )}

          {/* Links */}
          {(application.linkedin_url || application.portfolio_url) && (
            <div className="flex gap-3 pt-1 border-t border-[#E8E6E0] pb-2">
              {application.linkedin_url && (
                <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#6B6B6B] hover:text-blue-400 transition flex items-center gap-1 text-xs font-medium">
                  <Link size={14} /> LinkedIn
                </a>
              )}
              {application.portfolio_url && (
                <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-[#6B6B6B] hover:text-emerald-400 transition flex items-center gap-1 text-xs font-medium">
                  <Code size={14} /> Portfolio / GitHub
                </a>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          {application.status !== 'impressive' && (
            <div className="pt-2 border-t border-[#E8E6E0] flex justify-end">
              <button
                onClick={() => onImpressive && onImpressive(application)}
                className="bg-gradient-to-r from-[#C8922A] to-[#D4A843] text-[#1A1A1A] rounded-xl px-4 py-2 font-bold text-sm hover:scale-105 transition-transform shadow-lg"
              >
                ✨ Impressive
              </button>
            </div>
          )}
          {application.status === 'impressive' && (
            <div className="pt-2 border-t border-[#E8E6E0] flex justify-end">
              <button
                disabled
                className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl px-4 py-2 font-bold text-sm cursor-not-allowed"
              >
                ✨ Marked Impressive
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
