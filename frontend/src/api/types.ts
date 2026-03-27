export interface UserInfo {
  id: number;
  email: string;
  display_name: string;
  phone?: string | null;
  role: string;
}

export interface ExhibitItem {
  id: number;
  name: string;
  era: string;
  category: string;
  hall_name: string;
  summary: string;
  detail: string;
  image_url: string;
  created_at: string;
  comments_count: number;
}

export interface ExhibitionItem {
  id: number;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  status: "展出中" | "即将开展" | "已结束";
  summary: string;
  poster_url: string;
  created_at: string;
}

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

export interface GuideInfo {
  id: number;
  open_hours: string;
  address: string;
  traffic_guide: string;
  ticket_info: string;
  map_link: string;
  visit_tips: string;
  updated_at: string;
}

export interface CommentItem {
  id: number;
  exhibit_id: number;
  content: string;
  status: string;
  created_at: string;
  user: UserInfo;
}

export interface ExhibitDetail extends ExhibitItem {
  comments: CommentItem[];
}

export interface VisitItem {
  id: number;
  visitor_name: string;
  phone: string;
  visit_date: string;
  party_size: number;
  note?: string | null;
  status: string;
  created_at: string;
}

export interface HomePayload {
  exhibits: ExhibitItem[];
  exhibitions: ExhibitionItem[];
  announcements: AnnouncementItem[];
  guide: GuideInfo;
  total_exhibits: number;
  total_exhibitions: number;
}

export interface AdminOverview {
  user_total: number;
  exhibit_total: number;
  exhibition_total: number;
  visit_total: number;
  comment_total: number;
}

export interface AdminCommentItem {
  id: number;
  content: string;
  status: string;
  created_at: string;
  exhibit_id: number;
  user_id: number;
}

