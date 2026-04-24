export interface DomainInfo {
  registrar?: string;
  creationDate?: string;
  serverLocation?: string;
}

export interface IPInfo {
  ip?: string;
  organization?: string;
  location?: string;
  associatedDomains?: string[];
  asn?: string;
  registrationDate?: string;
  reputationScore?: number;
}

export interface RelatedLink {
  url: string;
  reason: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: string;
}

export interface AnalysisReport {
  summary: string;
  riskScore: number;
  riskLevel: string;
  domainInfo: DomainInfo;
  ipInfo?: IPInfo;
  flags: string[];
  recommendations: string[];
  relatedLinks?: RelatedLink[];
  timeline?: TimelineEvent[];
  socialMediaPosts?: {
    platform: string;
    accountHandle: string;
    accountName: string;
    postContent?: string;
    postDate?: string;
    engagementMetrics?: {
      likes?: number;
      shares?: number;
      comments?: number;
      views?: number;
    };
  }[];
  externalThreatIntel?: {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
    total: number;
    permalink: string;
  };
}

export interface HistoryEntry {
  id: string;
  url: string;
  analyzedAt: string;
  riskScore: number;
  riskLevel: string;
  report: AnalysisReport;
}

export interface TargetPreview {
  url: string;
  title: string;
  category: string;
  snippet: string;
}

export interface InvestigationCase {
  id: string;
  name: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  assignedTo: string;
  createdAt: string;
  linkedUrlIds: string[]; // references HistoryEntry.id
}
