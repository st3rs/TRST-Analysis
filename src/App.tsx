import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  Server, 
  CalendarDays, 
  Activity, 
  CheckCircle2, 
  Crosshair,
  BadgeInfo,
  Clock,
  History,
  RotateCcw,
  Eye,
  Network,
  MapPin,
  Link as LinkIcon,
  ExternalLink,
  Users,
  MessageSquare,
  Share2,
  ThumbsUp,
  Lock,
  Calendar,
  GitCommit,
  ChevronDown,
  ChevronRight,
  Target,
  Briefcase,
  X
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useVirtualizer } from '@tanstack/react-virtual';
import CasesDashboard from './components/CasesDashboard';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// Set up Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

import { DomainInfo, IPInfo, RelatedLink, TimelineEvent, AnalysisReport, HistoryEntry, TargetPreview, InvestigationCase } from './types';

const translations = {
  en: {
    appTitle: "Central Link Analysis Portal",
    roleL1: "Role: Intelligence Analyst (L1)",
    roleL2: "Role: Field Investigator (L2)",
    roleL3: "Role: Commander (L3)"
  },
  th: {
    appTitle: "พอร์ทัลวิเคราะห์ลิงก์ส่วนกลาง",
    roleL1: "บทบาท: นักวิเคราะห์ข่าวกรอง (ระดับ 1)",
    roleL2: "บทบาท: ผู้ตรวจสอบภาคสนาม (ระดับ 2)",
    roleL3: "บทบาท: ผู้บัญชาการ (ระดับ 3)"
  }
};

const RestrictedAccess = ({ requiredLevel, title = "Access Restricted", lang = 'en' }: { requiredLevel: number, title?: string, lang?: 'en' | 'th' }) => (
  <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-50/50 border border-slate-100 rounded-md h-full min-h-[200px]">
    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-4">
      <Lock className="w-6 h-6 text-slate-400" />
    </div>
    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-1">
      {lang === 'th' ? (title === 'Access Restricted' ? 'ถูกจำกัดสิทธิ์การเข้าถึง' : title) : title}
    </h3>
    <p className="text-xs text-slate-500 mb-4 max-w-sm text-center">
      {lang === 'th' ? "ระดับการเข้าถึงปัจจุบันของคุณไม่เพียงพอสำหรับการดูข้อมูลข่าวกรองชุดนี้" : "Your current clearance level is insufficient to view this intelligence stream."}
    </p>
    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-300">
      {lang === 'th' ? `ต้องการการระดับเข้าถึงระดับ ${requiredLevel}` : `Requires Clearance L${requiredLevel}`}
    </Badge>
  </div>
);

const VirtualSocialMediaPosts = ({ posts }: { posts: Required<AnalysisReport>['socialMediaPosts'] }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });

  if (posts.length === 0) {
    return <div className="text-sm text-slate-500 italic p-4 text-center">No posts match the selected filters.</div>;
  }

  return (
    <div
      ref={parentRef}
      className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const post = posts[virtualItem.index];
          return (
            <div
              key={virtualItem.index}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm mb-4 mx-1">
                <div className="bg-slate-50 border-b border-slate-100 p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-semibold tracking-wider text-[9px] block">Platform</span>
                    <span className="font-mono font-medium text-slate-800">{post.platform}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold tracking-wider text-[9px] block">Handle / ID</span>
                    <span className="font-mono font-medium text-slate-800">{post.accountHandle}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 uppercase font-semibold tracking-wider text-[9px] block">Display Name</span>
                    <span className="text-slate-700">{post.accountName}</span>
                  </div>
                </div>

                {post.postContent && (
                  <div className="p-4 relative border-b border-slate-100">
                    <MessageSquare className="absolute top-4 right-4 w-4 h-4 text-slate-300" />
                    <p className="text-sm font-serif italic text-slate-700 pr-8">{post.postContent}</p>
                    {post.postDate && (
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">{post.postDate}</p>
                    )}
                  </div>
                )}

                {post.engagementMetrics && (
                  <div className="p-3 bg-slate-50 grid grid-cols-4 gap-2">
                    <div className="bg-white border border-slate-200 rounded p-2 text-center">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="font-mono text-xs font-semibold text-slate-700">{post.engagementMetrics.likes ?? 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2 text-center">
                      <Share2 className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="font-mono text-xs font-semibold text-slate-700">{post.engagementMetrics.shares ?? 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2 text-center">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="font-mono text-xs font-semibold text-slate-700">{post.engagementMetrics.comments ?? 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2 text-center">
                      <Eye className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="font-mono text-xs font-semibold text-slate-700">{post.engagementMetrics.views ?? 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'th'>('en');
  const t = translations[lang];
  const [clearanceLevel, setClearanceLevel] = useState<number>(3);
  const [targetUrl, setTargetUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [preview, setPreview] = useState<TargetPreview | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  
  const [historySearch, setHistorySearch] = useState('');
  const [historyRisk, setHistoryRisk] = useState('ALL');
  const [historyDateStart, setHistoryDateStart] = useState('');
  const [historyDateEnd, setHistoryDateEnd] = useState('');

  const [socialPlatformFilter, setSocialPlatformFilter] = useState('ALL');
  const [socialSortBy, setSocialSortBy] = useState('date');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    flags: true,
    recommendations: true,
    relations: true,
    timeline: true,
    social_media: true
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Ensure section is open before scrolling
      if (!expandedSections[id]) {
        setExpandedSections(prev => ({ ...prev, [id]: true }));
      }
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sentinel_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cases, setCases] = useState<InvestigationCase[]>(() => {
    try {
      const saved = localStorage.getItem('sentinel_cases');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeView, setActiveView] = useState<'SCANNER' | 'CASES'>('SCANNER');
  const [caseLinkingEntryId, setCaseLinkingEntryId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sentinel_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('sentinel_cases', JSON.stringify(cases));
  }, [cases]);

  const filteredHistory = history.filter(item => {
    if (historySearch) {
      const query = historySearch.toLowerCase();
      const matchUrl = item.url.toLowerCase().includes(query);
      const matchSummary = item.report.summary.toLowerCase().includes(query);
      if (!matchUrl && !matchSummary) return false;
    }
    
    if (historyRisk !== 'ALL') {
      if (item.riskLevel.toUpperCase() !== historyRisk) return false;
    }

    if (historyDateStart) {
      const start = new Date(historyDateStart);
      start.setHours(0, 0, 0, 0);
      if (new Date(item.analyzedAt) < start) return false;
    }

    if (historyDateEnd) {
      const end = new Date(historyDateEnd);
      end.setHours(23, 59, 59, 999);
      if (new Date(item.analyzedAt) > end) return false;
    }

    return true;
  });

  const getRiskColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'critical': return 'text-rose-600 bg-rose-600/10 border-rose-600/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const simulateProgress = () => {
    const steps = [
      { text: "Establishing secure connection...", progress: 15, delay: 500 },
      { text: "Extracing domain metadata...", progress: 35, delay: 1500 },
      { text: "Cross-referencing known threat registries...", progress: 60, delay: 3000 },
      { text: "Performing deep semantic analysis...", progress: 85, delay: 5000 },
      { text: "Finalizing intelligence report...", progress: 95, delay: 7000 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setProgress(step.progress);
        setLoadingText(step.text);
      }, step.delay);
    });
  };

  const fetchPreview = async (url: string) => {
    setIsPreviewing(true);
    setPreview(null);
    setError(null);
    setReport(null);

    try {
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Website title or entity name." },
          category: { type: Type.STRING, description: "Broad category (e.g. E-Commerce, Social Media, Forum, Suspicious)." },
          snippet: { type: Type.STRING, description: "A concise 1-2 sentence preview or known meta description." }
        }
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Fetch a quick preview/metadata for the website: ${url}. Use Google Search to find its title and context. Keep it brief.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      const data = JSON.parse(response.text.trim());
      setPreview({
        url: url,
        title: data.title,
        category: data.category,
        snippet: data.snippet
      });
    } catch (err: any) {
      setError(err?.message || "Failed to fetch top-level target preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    let normalizedUrl = targetUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    let isValid = false;
    try {
      const parsedUrl = new URL(normalizedUrl);
      const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      isValid = domainPattern.test(parsedUrl.hostname);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      setError("Invalid URL format. Please provide a valid domain or URL (e.g., example.com or https://example.com).");
      return;
    }

    setTargetUrl(normalizedUrl);
    await fetchPreview(normalizedUrl);
  };

  const executeDeepScan = async (urlToAnalyze: string) => {
    setTargetUrl(urlToAnalyze);
    setIsAnalyzing(true);
    setReport(null);
    setError(null);
    setProgress(0);
    
    simulateProgress();

    try {
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A formal, professional intelligence summary of the website/link contents and purpose." },
          riskScore: { type: Type.NUMBER, description: "Risk score from 0 to 100 based on likelihood of malicious intent." },
          riskLevel: { type: Type.STRING, description: "Low, Medium, High, or Critical." },
          domainInfo: {
            type: Type.OBJECT,
            properties: {
              registrar: { type: Type.STRING, description: "The domain registrar." },
              creationDate: { type: Type.STRING, description: "The date the domain was created." },
              serverLocation: { type: Type.STRING, description: "The physical server location or country." }
            }
          },
          ipInfo: {
            type: Type.OBJECT,
            properties: {
              ip: { type: Type.STRING, description: "Resolved IP Address" },
              organization: { type: Type.STRING, description: "Hosting provider or ASN organization" },
              location: { type: Type.STRING, description: "City & Country of the IP" },
              associatedDomains: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Other domains hosted on the same IP" },
              asn: { type: Type.STRING, description: "Autonomous System Number (ASN) details" },
              registrationDate: { type: Type.STRING, description: "IP Address Registration Date/Info" },
              reputationScore: { type: Type.NUMBER, description: "Historical IP reputation score (0-100, 100 being worst)" }
            }
          },
          relatedLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                reason: { type: Type.STRING, description: "Why this link is related" }
              }
            },
            description: "Other URLs, subdomains, or external links discovered during investigation"
          },
          flags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Any suspicious indicators, red flags, or notable operational security details."
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Formal recommendations for the investigating officer on what to do next based on this link."
          },
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Date or time of the event (e.g., '2023-01-15' or 'January 2023')" },
                title: { type: Type.STRING, description: "A brief, clear title for the event" },
                description: { type: Type.STRING, description: "More detailed context about the event" },
                type: { type: Type.STRING, description: "Must be 'registration', 'update', 'social', or 'other'" }
              }
            },
            description: "A chronological timeline of significant events (registration dates, updates, posts, discoveries)."
          },
          socialMediaPosts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING, description: "Name of the social media platform (e.g., Twitter, Facebook, Instagram, TikTok)" },
                accountHandle: { type: Type.STRING, description: "Username or handle (e.g., @johndoe)" },
                accountName: { type: Type.STRING, description: "Display name of the account" },
                postContent: { type: Type.STRING, description: "Extracted text content of the post/tweet/message" },
                postDate: { type: Type.STRING, description: "Date/time the post was published (if found)" },
                engagementMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    likes: { type: Type.INTEGER },
                    shares: { type: Type.INTEGER },
                    comments: { type: Type.INTEGER },
                    views: { type: Type.INTEGER }
                  }
                }
              }
            },
            description: "Information about social media posts/profiles if the target is a social media link"
          }
        }
      };

      const generationPromise = ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are an AI intelligence assistant for law enforcement. An officer has requested an analysis of the following link: ${urlToAnalyze}. Use Google Search to investigate this target. Present a highly formal, objective, and detailed intelligence report following the response schema. If this is a social media link, extract post details, user information (publicly available), and engagement metrics, and populate 'socialMediaPosts' with a list of relevant posts. Include a chronological timeline of significant events (such as domain registration, latest updates, or social media activity) in the 'timeline' field. The report MUST be written in ${lang === 'th' ? 'Thai' : 'English'} language.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      const threatIntelPromise = fetch(`/api/threat-intel?url=${encodeURIComponent(urlToAnalyze)}`)
        .then(res => res.json())
        .catch(err => {
          console.error("Threat intel fetch failed:", err);
          return null;
        });

      const [response, threatIntel] = await Promise.all([generationPromise, threatIntelPromise]);

      const data = JSON.parse(response.text.trim());
      let reportData = data as AnalysisReport;
      
      if (threatIntel && !threatIntel.error) {
        reportData.externalThreatIntel = threatIntel;
        if (threatIntel.malicious && threatIntel.malicious > 0) {
          reportData.flags = [
            `EXTERNAL INTEL: Target flagged as malicious by threat intelligence engines (${threatIntel.malicious} detections).`,
            ...(reportData.flags || [])
          ];
          reportData.riskScore = Math.max(reportData.riskScore, 85);
          reportData.riskLevel = 'Critical';
        } else if (threatIntel.suspicious && threatIntel.suspicious > 0) {
          reportData.flags = [
            `EXTERNAL INTEL: Target flagged as suspicious by threat intelligence engines (${threatIntel.suspicious} detections).`,
            ...(reportData.flags || [])
          ];
          reportData.riskScore = Math.max(reportData.riskScore, 65);
          if (reportData.riskScore >= 70 && reportData.riskLevel !== 'Critical') {
            reportData.riskLevel = 'High';
          }
        }
      }

      setReport(reportData);
      setProgress(100);
      setLoadingText("Analysis Complete");

      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        url: urlToAnalyze,
        analyzedAt: new Date().toISOString(),
        riskScore: reportData.riskScore,
        riskLevel: reportData.riskLevel,
        report: reportData
      };
      setHistory(prev => [newEntry, ...prev.filter(h => h.url !== urlToAnalyze)].slice(0, 20));

    } catch (err: any) {
      setError(err?.message || "Failed to analyze the target URL.");
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600/30 flex flex-col">
      {caseLinkingEntryId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Link Asset to Case
              </h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500" onClick={() => setCaseLinkingEntryId(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {cases.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm">No active cases found.</p>
                  <p className="text-xs mt-1">Go to Case Management to create one.</p>
                </div>
              ) : (
                cases.map(c => {
                  const isLinked = c.linkedUrlIds.includes(caseLinkingEntryId);
                  return (
                    <div key={c.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-sm text-slate-800">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.id}</div>
                      </div>
                      {isLinked ? (
                        <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">Linked</Badge>
                      ) : (
                        <Button size="sm" className="h-7 text-xs bg-blue-700 hover:bg-blue-800 px-3" onClick={() => {
                          setCases(cases.map(x => x.id === c.id ? { ...x, linkedUrlIds: [...new Set([...x.linkedUrlIds, caseLinkingEntryId])] } : x));
                          setCaseLinkingEntryId(null);
                        }}>Link</Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
      {/* Top Navbar */}
      <header className="py-3 px-4 sm:px-8 bg-white border-b border-slate-200 sticky top-0 z-10 w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-7xl mx-auto justify-between">
          <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
                <Crosshair className="w-5 h-5 shrink-0" />
              </div>
              <h1 className="text-lg font-semibold text-slate-700 underline underline-offset-8 decoration-blue-600 tracking-tight hidden lg:block">{t.appTitle}</h1>
            </div>
            
            <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 w-full sm:w-auto overflow-x-auto">
              <button 
                onClick={() => setActiveView('SCANNER')}
                className={`flex-1 sm:flex-none text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2 sm:px-4 py-1.5 rounded transition-all whitespace-nowrap ${activeView === 'SCANNER' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Search className="w-3.5 h-3.5 inline-block mr-1.5 sm:hidden" />
                <span className="hidden sm:inline">Intelligence Center</span>
                <span className="sm:hidden">Intel</span>
              </button>
              <button 
                onClick={() => setActiveView('CASES')}
                className={`flex-1 sm:flex-none text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2 sm:px-4 py-1.5 rounded transition-all whitespace-nowrap ${activeView === 'CASES' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Briefcase className="w-3.5 h-3.5 inline-block mr-1.5 sm:hidden" />
                <span className="hidden sm:inline">Case Management</span>
                <span className="sm:hidden">Cases</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            <select 
              className="text-[10px] sm:text-xs font-mono bg-slate-50 px-2 sm:px-3 py-1.5 rounded border border-slate-300 font-medium text-slate-600 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'th')}
            >
              <option value="en">🇺🇸 EN</option>
              <option value="th">🇹🇭 TH</option>
            </select>
            <select 
              className="text-[10px] sm:text-xs font-mono bg-slate-50 px-2 sm:px-3 py-1.5 rounded border border-slate-300 font-medium text-slate-600 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors hidden md:block"
              value={clearanceLevel}
              onChange={(e) => setClearanceLevel(Number(e.target.value))}
            >
              <option value={1}>{t.roleL1}</option>
              <option value={2}>{t.roleL2}</option>
              <option value={3}>{t.roleL3}</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8 flex-1">
        {activeView === 'CASES' ? (
          <CasesDashboard 
            cases={cases} 
            setCases={setCases} 
            history={history} 
            lang={lang} 
            onViewUrl={(url) => {
              const item = history.find(h => h.url === url);
              if (item) {
                setActiveView('SCANNER');
                setTargetUrl(item.url);
                setReport(item.report);
                setPreview(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        ) : (
          <>
            {/* Search Input Area */}
            <section>
              <Card className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Search className="w-4 h-4" /> Target Identification
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-1">
                Enter the suspicious URL or domain below to initiate deep semantic analysis and threat cross-referencing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 group w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g., http://suspicious-domain.com/login"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="pl-10 h-10 w-full bg-white border border-slate-300 rounded focus-visible:ring-blue-600 font-mono text-sm shadow-sm"
                    disabled={isAnalyzing || isPreviewing}
                  />
                </div>
                {!preview ? (
                  <Button 
                    type="submit" 
                    disabled={isPreviewing || !targetUrl.trim()}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition whitespace-nowrap min-w-[120px] h-10"
                  >
                    {isPreviewing ? (
                      <><Activity className="w-4 h-4 mr-2 animate-spin sm:block" /> Fetching...</>
                    ) : (
                      <><Eye className="w-4 h-4 mr-2 sm:block" /> Load Target</>
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={isAnalyzing}
                    onClick={() => { setPreview(null); setTargetUrl(''); setReport(null); setError(null); }}
                    className="w-full sm:w-auto px-4 py-2 bg-white border-slate-300 text-slate-700 rounded text-xs font-medium transition whitespace-nowrap h-10"
                  >
                    Clear Target
                  </Button>
                )}
              </form>

              <AnimatePresence>
                {preview && !isAnalyzing && !report && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-slate-100"
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div className="space-y-2 flex-1 pr-4">
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className="font-semibold text-slate-800 tracking-tight text-sm">{preview.title || "Unknown Entity"}</h4>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-500 bg-white shadow-sm border-slate-200">
                            {preview.category || "Uncategorized"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{preview.snippet || "No immediate metadata snippet available for this target."}</p>
                      </div>
                      <Button 
                        onClick={() => executeDeepScan(preview.url)}
                        className="w-full md:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium shadow transition shrink-0"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Execute Deep Scan
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </CardContent>
            
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-600">
                        {loadingText || "Initializing..."}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-500">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-slate-200 overflow-hidden rounded-full">
                      <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </Progress>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </section>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="uppercase tracking-wide font-semibold text-xs">Extraction Failed</AlertTitle>
            <AlertDescription className="text-sm font-medium mt-1">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Dashboard */}
        <AnimatePresence>
          {report && !isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded p-4 shadow-sm">
                 <div className="flex items-center gap-2">
                   <Target className="w-5 h-5 text-blue-600" />
                   <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">Intelligence Asset: {targetUrl}</h3>
                 </div>
                 <Button onClick={() => {
                   const entryId = history.find(h => h.url === targetUrl)?.id;
                   if (entryId) setCaseLinkingEntryId(entryId);
                 }} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white shadow">
                   <Briefcase className="w-4 h-4 mr-2" /> Link to Case
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Quick Stats & Domain Info */}
              <div className="space-y-6 md:col-span-1">
                <Card className="bg-white border border-slate-200 rounded shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${report.riskScore >= 70 ? 'bg-red-500' : report.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <CardHeader className="pl-6 pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
                      Threat Assessment
                      <Activity className="w-4 h-4 text-slate-300" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pl-6 pt-2 pb-6">
                    <div className="flex items-baseline gap-2 mt-1">
                      <h2 className="text-3xl font-light text-slate-800">{report.riskScore}</h2>
                      <span className="text-xs font-semibold text-slate-400 uppercase">/ 100</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className={`px-3 py-1 uppercase tracking-wider font-semibold text-[10px] rounded border ${getRiskColor(report.riskLevel)} hover:${getRiskColor(report.riskLevel)}`}>
                        {report.riskLevel} RISK
                      </Badge>
                      {report.externalThreatIntel && report.externalThreatIntel.total > 0 && (
                        <a href={report.externalThreatIntel.permalink} target="_blank" rel="noopener noreferrer">
                          <Badge variant="outline" className={`px-3 py-1 uppercase tracking-wider font-semibold text-[10px] rounded border ${(report.externalThreatIntel.malicious > 0 || report.externalThreatIntel.suspicious > 0) ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} cursor-pointer flex items-center transition-colors`}>
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            VT: {report.externalThreatIntel.malicious + report.externalThreatIntel.suspicious} / {report.externalThreatIntel.total} Flags
                          </Badge>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 rounded shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-2">
                      <Server className="w-4 h-4 text-slate-300" />
                      Domain Registry Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Registrar</span>
                        <span className="text-sm font-mono text-slate-800">{report.domainInfo?.registrar || "REDACTED / UNKNOWN"}</span>
                      </div>
                      <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Creation Date</span>
                        <span className="text-sm font-mono text-slate-800 flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          {report.domainInfo?.creationDate || "UNKNOWN"}
                        </span>
                      </div>
                      <div className="px-6 py-3 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Server Location</span>
                        <span className="text-sm font-mono text-slate-800 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {report.domainInfo?.serverLocation || "UNKNOWN"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {clearanceLevel >= 2 ? (
                  <Card className="bg-white border border-slate-200 rounded shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-2">
                        <Network className="w-4 h-4 text-slate-300" />
                        Network Infrastructure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex flex-col">
                        <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">IP Address</span>
                          <span className="text-sm font-mono text-slate-800 font-medium">{report.ipInfo?.ip || "UNKNOWN"}</span>
                        </div>
                        <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Organization / ISP</span>
                          <span className="text-sm font-mono text-slate-800">{report.ipInfo?.organization || "UNKNOWN"}</span>
                        </div>
                        <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">ASN Details</span>
                          <span className="text-sm font-mono text-slate-800">{report.ipInfo?.asn || "UNKNOWN"}</span>
                        </div>
                        <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Registration Info</span>
                          <span className="text-sm font-mono text-slate-800">{report.ipInfo?.registrationDate || "UNKNOWN"}</span>
                        </div>
                        <div className="px-6 py-3 border-b border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">IP Reputation Score</span>
                          <div className="flex items-center gap-2">
                             <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${report.ipInfo?.reputationScore && report.ipInfo.reputationScore > 70 ? 'bg-red-500' : report.ipInfo?.reputationScore && report.ipInfo.reputationScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${report.ipInfo?.reputationScore || 0}%` }}
                                ></div>
                             </div>
                             <span className="text-xs font-mono font-medium w-8 text-right bg-slate-50 border border-slate-200 px-1 rounded">{report.ipInfo?.reputationScore !== undefined ? report.ipInfo.reputationScore : "N/A"}</span>
                          </div>
                        </div>
                        <div className="px-6 py-3 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Geo-Location</span>
                          <span className="text-sm font-mono text-slate-800 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {report.ipInfo?.location || "UNKNOWN"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <RestrictedAccess requiredLevel={2} title="Network Infrastructure" />
                )}
              </div>

              {/* Right Column: Detailed Analysis Sections */}
              <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6 items-start">
                
                {/* Jump to Navigation */}
                <div className="sticky top-6 hidden lg:flex flex-col gap-1 bg-white border border-slate-200 rounded-md p-3 shadow-sm">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 mb-2 px-2">Jump to Section</span>
                  <button onClick={() => scrollToSection('overview')} className={`text-left text-xs font-medium px-2 py-1.5 rounded transition-colors ${expandedSections.overview ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Intelligence Summary</button>
                  <button onClick={() => scrollToSection('flags')} className={`text-left text-xs font-medium px-2 py-1.5 rounded transition-colors ${expandedSections.flags ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Threat Indicators</button>
                  <button onClick={() => scrollToSection('recommendations')} className={`text-left text-xs font-medium px-2 py-1.5 rounded transition-colors ${expandedSections.recommendations ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Action Directives</button>
                  <button onClick={() => scrollToSection('relations')} className={`text-left text-xs font-medium px-2 py-1.5 rounded transition-colors ${expandedSections.relations ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Related Targets</button>
                  {report.timeline && report.timeline.length > 0 && (
                    <button onClick={() => scrollToSection('timeline')} className={`text-left text-xs font-medium px-2 py-1.5 rounded transition-colors ${expandedSections.timeline ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Timeline Activity</button>
                  )}
                  {report.socialMediaPosts && report.socialMediaPosts.length > 0 && (
                    <button onClick={() => scrollToSection('social_media')} className={`text-left text-xs font-medium px-2 py-1.5 rounded transition-colors ${expandedSections.social_media ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>Social Media Intel</button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Intelligence Summary */}
                  <Card id="overview" className="bg-white border border-slate-200 shadow-sm overflow-hidden scroll-m-6">
                    <CardHeader onClick={() => toggleSection('overview')} className="cursor-pointer bg-slate-50 flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <BadgeInfo className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-800 m-0">Executive Summary</CardTitle>
                      </div>
                      {expandedSections.overview ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </CardHeader>
                    {expandedSections.overview && (
                      <CardContent className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                        <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                          {report.summary}
                        </p>
                      </CardContent>
                    )}
                  </Card>

                  {/* Threat Indicators */}
                  <Card id="flags" className="bg-white border border-slate-200 shadow-sm overflow-hidden scroll-m-6">
                    <CardHeader onClick={() => toggleSection('flags')} className="cursor-pointer bg-slate-50 flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-800 m-0">Identified Red Flags</CardTitle>
                      </div>
                      {expandedSections.flags ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </CardHeader>
                    {expandedSections.flags && (
                      <CardContent className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                        {clearanceLevel >= 2 ? (
                          report.flags && report.flags.length > 0 ? (
                            <ul className="space-y-3">
                              {report.flags.map((flag, idx) => (
                                <li key={idx} className="flex gap-3 bg-red-50 p-3 text-sm text-slate-700 border border-red-100 rounded-md">
                                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                                  <span>{flag}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-4 border border-emerald-100 rounded-md">
                              <ShieldCheck className="w-5 h-5" />
                              <span className="font-medium">No significant threat indicators automatically detected. Remain vigilant.</span>
                            </div>
                          )
                        ) : (
                          <RestrictedAccess requiredLevel={2} title="Threat Indicators" />
                        )}
                      </CardContent>
                    )}
                  </Card>

                  {/* Recommendations */}
                  <Card id="recommendations" className="bg-white border border-slate-200 shadow-sm overflow-hidden scroll-m-6">
                    <CardHeader onClick={() => toggleSection('recommendations')} className="cursor-pointer bg-slate-50 flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-800 m-0">Recommended Actions</CardTitle>
                      </div>
                      {expandedSections.recommendations ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </CardHeader>
                    {expandedSections.recommendations && (
                      <CardContent className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                        {clearanceLevel >= 3 ? (
                          report.recommendations && report.recommendations.length > 0 ? (
                            <ul className="space-y-3">
                              {report.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-700 p-2">
                                  <div className="w-6 h-6 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-xs font-bold">
                                    {idx + 1}
                                  </div>
                                  <span className="mt-0.5">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500 italic">No specific action directives generated for this target.</p>
                          )
                        ) : (
                          <RestrictedAccess requiredLevel={3} title="Action Directives" />
                        )}
                      </CardContent>
                    )}
                  </Card>

                  {/* Relations */}
                  <Card id="relations" className="bg-white border border-slate-200 shadow-sm overflow-hidden scroll-m-6">
                    <CardHeader onClick={() => toggleSection('relations')} className="cursor-pointer bg-slate-50 flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-800 m-0">Associated Entities & Related Links</CardTitle>
                      </div>
                      {expandedSections.relations ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </CardHeader>
                    {expandedSections.relations && (
                      <CardContent className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                        {clearanceLevel >= 2 ? (
                          <div className="space-y-4">
                            {report.ipInfo?.associatedDomains && report.ipInfo.associatedDomains.length > 0 && (
                               <div className="mb-6">
                                 <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">Co-hosted Domains (Same IP)</h4>
                                 <div className="flex flex-wrap gap-2">
                                    {report.ipInfo.associatedDomains.map((domain, i) => (
                                      <Button key={i} variant="outline" size="sm" className="h-7 text-xs font-mono bg-slate-50 text-slate-600 border-slate-200" onClick={() => { setPreview(null); executeDeepScan(domain); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                        {domain} <ExternalLink className="w-3 h-3 ml-1" />
                                      </Button>
                                    ))}
                                 </div>
                               </div>
                            )}

                            <div>
                              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">Discovered Pivot Points</h4>
                              {report.relatedLinks && report.relatedLinks.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                  {report.relatedLinks.map((link, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-slate-100 bg-slate-50 rounded-md">
                                      <div className="space-y-1 overflow-hidden">
                                        <div className="font-mono text-sm text-blue-700 truncate font-medium">{link.url}</div>
                                        <div className="text-xs text-slate-500 line-clamp-1">{link.reason}</div>
                                      </div>
                                      <Button size="sm" className="shrink-0 text-xs px-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100" onClick={() => { setPreview(null); executeDeepScan(link.url); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                        <Search className="w-3.5 h-3.5 mr-1" /> Investigate
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500 italic">No direct lateral movement pivot points identified.</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <RestrictedAccess requiredLevel={2} title="Related Targets" />
                        )}
                      </CardContent>
                    )}
                  </Card>

                  {/* Timeline */}
                  {report.timeline && report.timeline.length > 0 && (
                    <Card id="timeline" className="bg-white border border-slate-200 shadow-sm overflow-hidden scroll-m-6">
                      <CardHeader onClick={() => toggleSection('timeline')} className="cursor-pointer bg-slate-50 flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-800 m-0">Chronological Event Timeline</CardTitle>
                        </div>
                        {expandedSections.timeline ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </CardHeader>
                      {expandedSections.timeline && (
                        <CardContent className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                          <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-8 py-2 mt-2">
                            {report.timeline.map((event, idx) => (
                              <div key={idx} className="relative">
                                <div className="absolute -left-[33px] bg-white border-2 border-blue-500 rounded-full w-4 h-4 flex items-center justify-center top-1">
                                  <div className="bg-blue-500 rounded-full w-1.5 h-1.5"></div>
                                </div>
                                <div className="flex flex-col gap-1.5 auto-cols-auto">
                                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-slate-100 self-start px-2 py-0.5 rounded border border-slate-200">{event.date}</span>
                                  <div className="bg-white border border-slate-200 rounded-md p-3 shadow-sm hover:border-slate-300 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="text-sm font-semibold text-slate-800">{event.title}</h4>
                                      {event.type && (
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-slate-400 border-slate-200 shrink-0">
                                          {event.type}
                                        </Badge>
                                      )}
                                    </div>
                                    {event.description && (
                                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                        {event.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Social Media */}
                  {report.socialMediaPosts && report.socialMediaPosts.length > 0 && (
                    <Card id="social_media" className="bg-white border border-slate-200 shadow-sm overflow-hidden scroll-m-6">
                      <CardHeader onClick={() => toggleSection('social_media')} className="cursor-pointer bg-slate-50 flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-800 m-0">Social Media Target Profile</CardTitle>
                        </div>
                        {expandedSections.social_media ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </CardHeader>
                      {expandedSections.social_media && (
                        <CardContent className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500">Filtered Posts Map</h4>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              <select 
                                className="flex-1 sm:flex-none text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                value={socialPlatformFilter}
                                onChange={(e) => setSocialPlatformFilter(e.target.value)}
                              >
                                <option value="ALL">All Platforms</option>
                                {Array.from(new Set(report.socialMediaPosts.map(p => p.platform))).map(platform => (
                                  <option key={platform} value={platform}>{platform}</option>
                                ))}
                              </select>
                              <select 
                                className="flex-1 sm:flex-none text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                value={socialSortBy}
                                onChange={(e) => setSocialSortBy(e.target.value)}
                              >
                                <option value="date">Sort by Date</option>
                                <option value="likes">Sort by Likes</option>
                                <option value="shares">Sort by Shares</option>
                                <option value="views">Sort by Views</option>
                              </select>
                            </div>
                          </div>
                          
                          {(() => {
                            let posts = [...report.socialMediaPosts];
                            if (socialPlatformFilter !== 'ALL') {
                              posts = posts.filter(p => p.platform === socialPlatformFilter);
                            }
                            posts.sort((a, b) => {
                              if (socialSortBy === 'likes') return (b.engagementMetrics?.likes || 0) - (a.engagementMetrics?.likes || 0);
                              if (socialSortBy === 'shares') return (b.engagementMetrics?.shares || 0) - (a.engagementMetrics?.shares || 0);
                              if (socialSortBy === 'views') return (b.engagementMetrics?.views || 0) - (a.engagementMetrics?.views || 0);
                              return (b.postDate || '').localeCompare(a.postDate || '');
                            });

                            return <VirtualSocialMediaPosts posts={posts} />;
                          })()}
                        </CardContent>
                      )}
                    </Card>
                  )}
                </div>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        <section className="mt-8">
          <Card className="bg-white border border-slate-200 rounded shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4" /> Scan History
              </CardTitle>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setHistory([])} className="text-xs text-slate-500 hover:text-red-600 uppercase font-semibold tracking-wide">
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {history.length > 0 && (
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search URLs or report summaries..." 
                        className="pl-9 bg-white text-xs h-9 font-mono" 
                        value={historySearch}
                        onChange={e => setHistorySearch(e.target.value)}
                      />
                    </div>
                    <select 
                      className="bg-white border border-slate-300 rounded text-xs px-3 h-9 focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 shadow-sm font-semibold tracking-wide uppercase appearance-none sm:w-40"
                      value={historyRisk}
                      onChange={e => setHistoryRisk(e.target.value)}
                    >
                      <option value="ALL">All Risks</option>
                      <option value="LOW">Low Risk</option>
                      <option value="MEDIUM">Medium Risk</option>
                      <option value="HIGH">High Risk</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="date" 
                        className="h-9 text-xs bg-white w-full sm:w-auto shadow-sm text-slate-600 font-mono" 
                        value={historyDateStart} 
                        onChange={e => setHistoryDateStart(e.target.value)} 
                      />
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">to</span>
                      <Input 
                        type="date" 
                        className="h-9 text-xs bg-white w-full sm:w-auto shadow-sm text-slate-600 font-mono" 
                        value={historyDateEnd} 
                        onChange={e => setHistoryDateEnd(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <p>No recent scans. History will appear here.</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <p>No history entries match your current filters.</p>
                  <Button variant="link" onClick={() => { setHistorySearch(''); setHistoryRisk('ALL'); setHistoryDateStart(''); setHistoryDateEnd(''); }} className="mt-2 text-blue-600">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <Badge className={`px-2 py-0.5 uppercase tracking-wider font-semibold text-[10px] rounded border ${getRiskColor(item.riskLevel)}`}>
                            {item.riskScore} - {item.riskLevel}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            {new Date(item.analyzedAt).toLocaleDateString()} {new Date(item.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-sm font-mono font-medium text-slate-800 truncate" title={item.url}>
                          {item.url}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs font-semibold px-3 uppercase text-slate-600 bg-white"
                          onClick={() => {
                            setTargetUrl(item.url);
                            setReport(item.report);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 text-xs font-semibold px-3 uppercase bg-slate-100 text-slate-700 hover:bg-slate-200"
                          onClick={() => {
                            setPreview(null);
                            executeDeepScan(item.url);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={isAnalyzing}
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          Re-Scan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        </>
        )}

      </main>
    </div>
  );
}

