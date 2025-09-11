export interface BaseContent {
  title?: string;
  slug: string;
  template_version: number;
  editor: string;
  status: 'active' | 'inactive' | 'deprecated' | 'merged' | 'alumni';
  created: string;
  updated: string;
  tags?: string[];
}

export interface Insight extends BaseContent {
  type: 'insight';
  title: string;
  category: 'anecdotal' | 'econometric' | 'empirical' | 'fact' | 'practical' | 'theoretical';
  summary: string;
  sources: string[];
  authors: string[];
  related_insights: string[];
  relevance_score: 'high' | 'medium' | 'low';
  whitepaper_section: string;
  key_findings: string[];
  implications: string[];
  research_questions: string[];
  quality_rating: number;
  key_finding?: string;
  limitations?: string[];
}

export interface Source extends BaseContent {
  type: 'source';
  title: string;
  source_type: 'journal_article' | 'academic_paper' | 'article' | 'book' | 'poll' | 'report' | 'visualization';
  authors: string[];
  publication_date: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  url?: string;
  doi?: string;
  isbn?: string;
  citation?: string;
  summary?: string;
  related_insights?: string[];
  relevance_score?: 'high' | 'medium' | 'low';
  key_points: string[];
  methodology?: string;
  limitations?: string[];
  applications?: string[];
  relevance_to_project: string;
  quality_assessment: string;
  peer_reviewed: boolean;
  open_access: boolean;
  language: string;
}

export interface Author extends BaseContent {
  type: 'author';
  name: string;
  affiliation?: string;
  email?: string;
  website?: string;
  orcid?: string;
  bio: string;
  expertise: string[];
  key_publications: string[];
  sources_by_author: string[];
  relevance_to_project: string;
  collaboration_notes?: string;
}

export interface Tag extends BaseContent {
  type: 'tag';
  name: string;
  category: 'topic' | 'methodology' | 'protocol_aspect' | 'economic_theory' | 'technology' | 'other';
  description: string;
  usage_guidelines: string[];
  related_tags: string[];
  tagged_content_types: string[];
  evolution_notes?: string;
}

export interface Contributor extends BaseContent {
  type: 'contributor';
  name: string;
  role: string;
  email?: string;
  github?: string;
  bio: string;
  expertise: string[];
}

export type ContentType = Insight | Source | Author | Tag | Contributor;

export interface ContentWithContent {
  frontmatter: ContentType;
  content: string;
  slug: string;
}