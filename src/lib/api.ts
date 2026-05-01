export const API_BASE_URL = String(
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com"
).replace(/\/+$/, "");

export type SeatUser = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  teamRole?: "OWNER" | "MEMBER" | null;
};

export type TeamPolicy = {
  includedUsers?: number;
  seatsUsed?: number;
  seatsLimit?: number | null;
  seatsRemaining?: number | null;
  seatAddOnEnabled?: boolean;
  billingActive?: boolean;
};

export type UserEntitlements = {
  id?: string;
  email?: string;
  linkedinProfileUrl?: string;
  fullName?: string;
  avatarUrl?: string | null;
  role?: string | null;
  isAdmin?: boolean;
  plan?: string;
  status?: string;
  subscriptionStatus?: string | null;
  nextResetAt?: string | null;
  quota_reset_at?: string | null;
  trialEndsAt?: string | null;
  periodEnd?: string | null;
  createdAt?: string | null;
  teamRole?: "OWNER" | "MEMBER" | null;
};

export type LeadHistoryPoint = {
  date: string;
  hot: number;
  warm: number;
  cold: number;
};

export type DashboardSnapshot = {
  leadStats?: {
    TOTAL?: number;
    HOT?: number;
    WARM?: number;
    COLD?: number;
  };
  leadsCount?: number;
  actionable?: number;
  deciders?: number;
  ignored?: number;
  conversionPct?: number;
  lastCaptureAt?: string | null;
  leadHistory?: LeadHistoryPoint[] | null;
};

export type SeoIssueItem = {
  key?: string;
  msg?: string;
  severity?: "critical" | "warning" | "info";
};

export type SeoSignals = {
  seoLevel?: string;
  siteType?: string;
  auditCoverage?: string;
  role?: string;
  websiteStatus?: string;
  rawScore?: number;
  seoSource?: string;
  seoIssues?: SeoIssueItem[];
  seoPassed?: string[];
  categories?: Record<string, { score?: number; max?: number }>;
  techFingerprint?: {
    cms?: string | null;
    renderType?: string | null;
    frameworks?: string[];
  };
  cwv?: {
    delta?: number | null;
    base?: number | null;
    adjusted?: number | null;
    scores?: {
      performance?: number | null;
      seo?: number | null;
      accessibility?: number | null;
      bestPractices?: number | null;
    };
    metrics?: {
      lcp?: number | null;
      cls?: number | null;
      fcp?: number | null;
      tbt?: number | null;
    };
  };
};

export type SeoUiFields = {
  actionLabel?: string;
  confidence?: string;
  reason?: string;
  seoBadge?: string;
  seoColor?: string;
  scoreDisplay?: string;
  rawScore?: number;
  categoriesDisplay?: Record<string, string>;
  siteType?: string;
  siteTypeLabel?: string;
  techStackLabel?: string;
  renderType?: string;
  auditCoverage?: string;
  auditCoverageLabel?: string;
  mobilePerf?: number | null;
  mobileA11y?: number | null;
  psSeoScore?: number | null;
  lcpMs?: number | null;
  clsScore?: number | null;
  fcpMs?: number | null;
  tbtMs?: number | null;
  cwvDelta?: number | null;
};

export type OpportunityDecision = {
  leadType?: string;
  final?: string;
  confidence?: string;
  reason?: string;
  signals?: SeoSignals;
};

export type LeadRecord = {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  company?: string;
  website?: string;
  leadType?: string;
  createdAt?: string;
  updatedAt?: string;
  ui?: SeoUiFields;
  decision?: OpportunityDecision;
  opportunities?: Array<{
    id?: string;
    company?: string;
    website?: string;
    leadType?: string;
    opportunityStatus?: string;
    role?: string;
    action?: string;
    seoLevel?: string;
    siteType?: string;
    rawScore?: number;
    seoSource?: string;
    websiteStatus?: string;
    seoIssues?: SeoIssueItem[];
    seoPassed?: string[];
    bestPractices?: number | null;
    gatheredAt?: string | null;
    reason?: string;
    ui?: SeoUiFields;
    decision?: OpportunityDecision;
  }>;
};

export type EntitlementsResponse = {
  ok: boolean;
  user?: UserEntitlements;
  limits?: Record<string, number>;
  usage?: Record<string, number>;
  remaining?: Record<string, number>;
  features?: Record<string, boolean>;
  team?: TeamPolicy;
  seatUsers?: SeatUser[];
};

export type DashboardResponse = EntitlementsResponse & {
  dashboard?: DashboardSnapshot;
  leads?: LeadRecord[];
};

export type AuthResponse = EntitlementsResponse & {
  token?: string;
  expiresAt?: string;
  emailSent?: boolean;
};

export type BillingProvidersResponse = {
  ok: boolean;
  defaultProvider?: string;
  pricesUsd?: Record<string, number>;
};

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message?: string) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      String(payload?.error || payload?.code || "API_ERROR"),
      String(payload?.hint || payload?.message || payload?.error || "Request failed")
    );
  }
  return payload as T;
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  inviteToken?: string;
}): Promise<AuthResponse> {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  return apiRequest<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
      fullName,
      ...(input.inviteToken ? { inviteToken: input.inviteToken } : {}),
    },
  });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: input,
  });
}

export async function fetchMe(token: string): Promise<EntitlementsResponse> {
  return apiRequest<EntitlementsResponse>("/v1/me", {
    method: "GET",
    token,
  });
}

export async function fetchDashboard(token: string): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>("/v1/dashboard?includeLeads=true", {
    method: "GET",
    token,
  });
}

export async function forgotPassword(email: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/v1/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(accessToken: string, newPassword: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/v1/auth/reset-password", {
    method: "POST",
    body: { accessToken, newPassword },
  });
}

export async function logoutUser(token: string): Promise<void> {
  await apiRequest<{ ok: boolean }>("/v1/auth/logout", {
    method: "POST",
    token,
  });
}

export async function fetchBillingProviders(): Promise<BillingProvidersResponse> {
  return apiRequest<BillingProvidersResponse>("/v1/billing/providers", {
    method: "GET",
  });
}

export type LeadsResponse = {
  ok: boolean;
  leads?: LeadRecord[];
};

export async function fetchLeads(token: string): Promise<LeadsResponse> {
  return apiRequest<LeadsResponse>("/v1/leads", { method: "GET", token });
}

export type GenerateMessageInput = {
  lead?: LeadRecord;
  leadId?: string;
  opportunityId?: string;
  messageType?: string;
  language?: string;
  context?: string;
};

export type GenerateMessageResponse = {
  ok: boolean;
  message?: string;
  variant?: string;
  variants?: string[];
  variantLabels?: string[];
};

export async function generateMessage(
  token: string,
  input: GenerateMessageInput
): Promise<GenerateMessageResponse> {
  return apiRequest<GenerateMessageResponse>("/v1/messages/generate", {
    method: "POST",
    token,
    body: input,
  });
}

export type GenerateQueryInput = {
  targetRoles?: string;
  geography?: string;
  keywords?: string;
  excludeKeywords?: string;
};

export type GenerateQueryResponse = {
  ok: boolean;
  query?: string;
};

export async function generateQuery(
  token: string,
  input: GenerateQueryInput
): Promise<GenerateQueryResponse> {
  return apiRequest<GenerateQueryResponse>("/v1/assistant/query", {
    method: "POST",
    token,
    body: input,
  });
}

export async function updateMe(
  token: string,
  data: { fullName?: string; linkedinProfileUrl?: string; avatarUrl?: string }
): Promise<EntitlementsResponse> {
  return apiRequest<EntitlementsResponse>("/v1/me", {
    method: "PATCH",
    token,
    body: data,
  });
}

export async function changePassword(
  token: string,
  data: { currentPassword: string; newPassword: string }
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/v1/me/password", {
    method: "POST",
    token,
    body: data,
  });
}

export interface SupportUserContext {
  email: string;
  plan: string;
  status: string;
  usage: { scans: number; seo: number; messages: number };
  limits: { scans: number; seo: number; messages: number };
  remaining: { scans: number; seo: number; messages: number };
  nextReset?: string | null;
}

export async function supportChat(
  token: string,
  messages: { role: "user" | "assistant"; content: string }[],
  userContext?: SupportUserContext
): Promise<{ ok: boolean; answer: string }> {
  return apiRequest<{ ok: boolean; answer: string }>("/v1/support/chat", {
    method: "POST",
    token,
    body: { messages, userContext },
  });
}

export async function getBillingCheckoutLink(
  token: string,
  plan: string
): Promise<{ ok: boolean; url?: string }> {
  return apiRequest<{ ok: boolean; url?: string }>("/v1/billing/checkout-link", {
    method: "POST",
    token,
    body: { plan },
  });
}

export type InviteResponse = {
  ok: boolean;
  message?: string;
  type?: "added" | "invite_link";
  inviteUrl?: string;
  email?: string;
  seatUser?: SeatUser;
};

export async function inviteTeamMember(
  token: string,
  email: string
): Promise<InviteResponse> {
  return apiRequest<InviteResponse>("/v1/team/invite", {
    method: "POST",
    token,
    body: { email },
  });
}

export async function removeTeamMember(
  token: string,
  userId: string
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/team/members/${userId}`, {
    method: "DELETE",
    token,
  });
}

export async function addSeat(
  token: string
): Promise<{ ok: boolean; url?: string }> {
  return apiRequest<{ ok: boolean; url?: string }>("/v1/billing/add-seat", {
    method: "POST",
    token,
  });
}

export async function fetchMemberDashboard(
  token: string,
  memberId: string
): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>(
    `/v1/team/members/${memberId}/dashboard?includeLeads=true`,
    { method: "GET", token }
  );
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  plan: string;
  status: string;
  role?: string | null;
  isAdmin?: boolean;
  trialEndsAt?: string | null;
  createdAt: string;
  lastActiveDate?: string | null;
  teamRole?: "OWNER" | "MEMBER" | null;
  ownerId?: string | null;
  ownerEmail?: string | null;
  memberCount?: number;
};

export type AdminStats = {
  ok: boolean;
  totalUsers: number;
  newToday: number;
  byPlan: Record<string, number>;
  activeSubs: number;
  totalLeads: number;
};

export type AdminUsersResponse = {
  ok: boolean;
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  return apiRequest<AdminStats>("/v1/admin/stats", { method: "GET", token });
}

export type AdminActivityDay = { day: string; scans: number; messages: number; seo: number; signups: number };
export async function fetchAdminActivity(token: string): Promise<{ ok: boolean; days: AdminActivityDay[] }> {
  return apiRequest("/v1/admin/activity", { method: "GET", token });
}

export async function fetchAdminUsers(
  token: string,
  params: { page?: number; limit?: number; search?: string; plan?: string; ownerId?: string; trialingSoon?: boolean } = {}
): Promise<AdminUsersResponse> {
  const qs = new URLSearchParams();
  if (params.page)         qs.set("page",          String(params.page));
  if (params.limit)        qs.set("limit",          String(params.limit));
  if (params.search)       qs.set("search",         params.search);
  if (params.plan)         qs.set("plan",           params.plan);
  if (params.ownerId)      qs.set("ownerId",        params.ownerId);
  if (params.trialingSoon) qs.set("trialing_soon",  "1");
  return apiRequest<AdminUsersResponse>(`/v1/admin/users?${qs.toString()}`, { method: "GET", token });
}

export async function extendAdminUserTrial(token: string, userId: string, days: number): Promise<{ ok: boolean; trialEndsAt: string }> {
  return apiRequest(`/v1/admin/users/${userId}/trial`, { method: "PATCH", token, body: { days } });
}

export async function extendAdminUserScans(token: string, userId: string, amount: number): Promise<{ ok: boolean; extraScans: number }> {
  return apiRequest(`/v1/admin/users/${userId}/scans`, { method: "PATCH", token, body: { amount } });
}

export async function exportAdminUsersCSV(token: string, params: { search?: string; plan?: string; trialingSoon?: boolean } = {}): Promise<string> {
  const qs = new URLSearchParams({ export: "csv", limit: "500" });
  if (params.search)       qs.set("search",        params.search);
  if (params.plan)         qs.set("plan",          params.plan);
  if (params.trialingSoon) qs.set("trialing_soon", "1");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.example.com";
  const res = await fetch(`${API_BASE}/v1/admin/users?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Export failed");
  return res.text();
}

export async function updateAdminUser(
  token: string,
  userId: string,
  updates: { plan?: string; status?: string }
): Promise<{ ok: boolean; user?: AdminUser }> {
  return apiRequest<{ ok: boolean; user?: AdminUser }>(`/v1/admin/users/${userId}`, {
    method: "PATCH",
    token,
    body: updates,
  });
}

export async function resetAdminUserData(
  token: string,
  userId: string
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/v1/admin/reset-user-data", {
    method: "POST",
    token,
    body: { targetUserId: userId },
  });
}

export async function deleteAdminUser(
  token: string,
  userId: string
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/admin/users/${userId}`, {
    method: "DELETE",
    token,
  });
}

export type AdminUserDetail = {
  id: string;
  email: string;
  fullName?: string | null;
  plan: string;
  status: string;
  isAdmin?: boolean;
  trialEndsAt?: string | null;
  subEndsAt?: string | null;
  createdAt: string;
  teamRole?: "MEMBER" | "OWNER" | null;
  ownerId?: string | null;
};

export type AdminUserDetailResponse = {
  ok: boolean;
  user: AdminUserDetail;
  usage: { profiles_scanned: number; messages_generated: number; seo_exports: number };
  limits: { profiles_scanned: number; messages_generated: number; seo_exports: number };
  allTime: { profiles_scanned: number; messages_generated: number; seo_exports: number; lastActivityDate: string | null };
  leads: { total: number; lastLeadAt: string | null };
  recentDays: { day: string; profiles_scanned: number; messages_generated: number; seo_exports: number }[];
};

export async function fetchAdminUserDetail(
  token: string,
  userId: string
): Promise<AdminUserDetailResponse> {
  return apiRequest<AdminUserDetailResponse>(`/v1/admin/users/${userId}`, { method: "GET", token });
}

// ─── Blog types ────────────────────────────────────────────────────────────
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_name: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// ─── Public blog API ───────────────────────────────────────────────────────
export async function fetchBlogPosts(params: { limit?: number; offset?: number; tag?: string } = {}): Promise<{ posts: BlogPost[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.limit)  qs.set("limit",  String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  if (params.tag)    qs.set("tag",    params.tag);
  return apiRequest<{ posts: BlogPost[]; total: number }>(`/v1/blog/posts?${qs.toString()}`, { method: "GET" });
}

export async function fetchBlogPost(slug: string): Promise<{ post: BlogPost }> {
  return apiRequest<{ post: BlogPost }>(`/v1/blog/posts/${slug}`, { method: "GET" });
}

// ─── Admin blog API ────────────────────────────────────────────────────────
export async function fetchAdminBlogPosts(token: string): Promise<{ posts: BlogPost[] }> {
  return apiRequest<{ posts: BlogPost[] }>("/v1/admin/blog/posts", { method: "GET", token });
}

export async function fetchAdminBlogPost(token: string, id: string): Promise<{ post: BlogPost }> {
  return apiRequest<{ post: BlogPost }>(`/v1/admin/blog/posts/${id}`, { method: "GET", token });
}

export async function createAdminBlogPost(token: string, data: Partial<BlogPost>): Promise<{ ok: boolean; post?: BlogPost }> {
  return apiRequest<{ ok: boolean; post?: BlogPost }>("/v1/admin/blog/posts", { method: "POST", token, body: data });
}

export async function updateAdminBlogPost(token: string, id: string, data: Partial<BlogPost>): Promise<{ ok: boolean; post?: BlogPost }> {
  return apiRequest<{ ok: boolean; post?: BlogPost }>(`/v1/admin/blog/posts/${id}`, { method: "PATCH", token, body: data });
}

export async function deleteAdminBlogPost(token: string, id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/admin/blog/posts/${id}`, { method: "DELETE", token });
}

// ─── Moderator API ─────────────────────────────────────────────────────────
export type Moderator = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export async function moderatorLogin(email: string, password: string): Promise<{ ok: boolean; token?: string; moderator?: Moderator }> {
  return apiRequest<{ ok: boolean; token?: string; moderator?: Moderator }>("/v1/moderator/login", { method: "POST", body: { email, password } });
}

export async function fetchAdminModerators(token: string): Promise<{ moderators: Moderator[] }> {
  return apiRequest<{ moderators: Moderator[] }>("/v1/admin/moderators", { method: "GET", token });
}

export async function createAdminModerator(token: string, data: { email: string; password: string; name: string }): Promise<{ ok: boolean; moderator?: Moderator }> {
  return apiRequest<{ ok: boolean; moderator?: Moderator }>("/v1/admin/moderators", { method: "POST", token, body: data });
}

export async function deleteAdminModerator(token: string, id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/admin/moderators/${id}`, { method: "DELETE", token });
}


// ─── Support Tickets API ───────────────────────────────────────────────────
export type TicketStatus = "open" | "in_progress" | "closed";

export type SupportTicket = {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  message_count?: number;
};

export type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_type: "user" | "admin";
  sender_name: string | null;
  content: string;
  created_at: string;
};

export async function fetchMyTickets(token: string): Promise<{ tickets: SupportTicket[] }> {
  return apiRequest<{ tickets: SupportTicket[] }>("/v1/support/tickets", { method: "GET", token });
}

export async function fetchTicket(token: string, id: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
  return apiRequest<{ ticket: SupportTicket; messages: SupportMessage[] }>(`/v1/support/tickets/${id}`, { method: "GET", token });
}

export async function createTicket(token: string, data: { subject: string; message: string }): Promise<{ ok: boolean; ticket: SupportTicket }> {
  return apiRequest<{ ok: boolean; ticket: SupportTicket }>("/v1/support/tickets", { method: "POST", token, body: data });
}

export async function replyTicket(token: string, id: string, content: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/support/tickets/${id}/messages`, { method: "POST", token, body: { content } });
}

export async function closeTicket(token: string, id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/support/tickets/${id}/close`, { method: "PATCH", token });
}

export async function fetchAdminTickets(token: string, status?: string): Promise<{ tickets: SupportTicket[] }> {
  const qs = status ? `?status=${status}` : "";
  return apiRequest<{ tickets: SupportTicket[] }>(`/v1/admin/support/tickets${qs}`, { method: "GET", token });
}

export async function fetchAdminTicket(token: string, id: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
  return apiRequest<{ ticket: SupportTicket; messages: SupportMessage[] }>(`/v1/admin/support/tickets/${id}`, { method: "GET", token });
}

export async function replyAdminTicket(token: string, id: string, content: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/admin/support/tickets/${id}/messages`, { method: "POST", token, body: { content } });
}

export async function updateAdminTicketStatus(token: string, id: string, status: TicketStatus): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/admin/support/tickets/${id}`, { method: "PATCH", token, body: { status } });
}

// ─── Message Logs ──────────────────────────────────────────────────────────

export type MessageLog = {
  id: string;
  profile_url: string;
  lead_name: string;
  opportunity_name?: string;
  generation_count: number;
  last_generated_at: string | null;
  was_manually_edited: boolean;
  sent_at: string | null;
  sent_status: string | null;
  message_preview: string | null;
  updated_at: string;
  created_at: string;
};

export async function fetchMessageLogs(token: string): Promise<{ ok: boolean; logs: MessageLog[] }> {
  return apiRequest<{ ok: boolean; logs: MessageLog[] }>("/v1/messages/logs", { method: "GET", token });
}

export async function logMessageGeneration(
  token: string,
  input: { profileUrl: string; leadName: string; opportunityName?: string; messagePreview?: string }
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/v1/messages/log", {
    method: "POST", token,
    body: { profileUrl: input.profileUrl, leadName: input.leadName, opportunityName: input.opportunityName || "", action: "generation", messagePreview: input.messagePreview || "" },
  });
}

export async function logMessageSent(
  token: string,
  input: { profileUrl: string; leadName: string; messagePreview: string; wasEdited: boolean; sentStatus?: string }
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/v1/messages/log", {
    method: "POST", token,
    body: { profileUrl: input.profileUrl, leadName: input.leadName, action: "sent", wasEdited: input.wasEdited, sentStatus: input.sentStatus || "SENT", messagePreview: input.messagePreview },
  });
}

// ─── Support Agent ──────────────────────────────────────────────────────────

export type SupportAgent = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type AgentUser = {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  plan: string;
  status: string;
  created_at: string;
  trial_ends_at?: string;
};

export async function supportAgentLogin(email: string, password: string): Promise<{ token: string; agent: SupportAgent }> {
  return apiRequest<{ token: string; agent: SupportAgent }>("/v1/support-agent/login", { method: "POST", body: { email, password } });
}

export async function fetchAdminSupportAgents(token: string): Promise<{ agents: SupportAgent[] }> {
  return apiRequest<{ agents: SupportAgent[] }>("/v1/admin/support-agents", { method: "GET", token });
}

export async function createAdminSupportAgent(token: string, data: { name: string; email: string; password: string }): Promise<{ agent: SupportAgent }> {
  return apiRequest<{ agent: SupportAgent }>("/v1/admin/support-agents", { method: "POST", token, body: data });
}

export async function deleteAdminSupportAgent(token: string, id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/admin/support-agents/${id}`, { method: "DELETE", token });
}

// ── Waitlist ──────────────────────────────────────────────────────────────

export type WaitlistEntry = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
};

export async function joinWaitlist(data: { email: string; name?: string; plan: string }): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/v1/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchAdminWaitlist(token: string): Promise<{ ok: boolean; entries: WaitlistEntry[]; total: number; byPlan: Record<string, number> }> {
  return apiRequest<{ ok: boolean; entries: WaitlistEntry[]; total: number; byPlan: Record<string, number> }>("/v1/admin/waitlist", { method: "GET", token });
}

export async function deleteAdminWaitlistEntry(token: string, id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/admin/waitlist/${id}`, { method: "DELETE", token });
}

export async function fetchAgentTickets(agentToken: string): Promise<{ tickets: (SupportTicket & { user?: { email: string; name?: string } })[] }> {
  return apiRequest<{ tickets: (SupportTicket & { user?: { email: string; name?: string } })[] }>("/v1/support-agent/tickets", { method: "GET", token: agentToken });
}

export async function fetchAgentTicket(agentToken: string, id: string): Promise<{ ticket: SupportTicket & { user?: { email: string; name?: string } }; messages: SupportMessage[] }> {
  return apiRequest<{ ticket: SupportTicket & { user?: { email: string; name?: string } }; messages: SupportMessage[] }>(`/v1/support-agent/tickets/${id}`, { method: "GET", token: agentToken });
}

export async function replyAgentTicket(agentToken: string, id: string, content: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/support-agent/tickets/${id}/messages`, { method: "POST", token: agentToken, body: { content } });
}

export async function updateAgentTicketStatus(agentToken: string, id: string, status: TicketStatus): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/support-agent/tickets/${id}`, { method: "PATCH", token: agentToken, body: { status } });
}

export async function fetchAgentUsers(agentToken: string, params?: { q?: string; plan?: string }): Promise<{ users: AgentUser[] }> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.plan) qs.set("plan", params.plan);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiRequest<{ users: AgentUser[] }>(`/v1/support-agent/users${query}`, { method: "GET", token: agentToken });
}

export async function updateAgentUser(agentToken: string, id: string, data: { plan?: string; status?: string; email?: string }): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/support-agent/users/${id}`, { method: "PATCH", token: agentToken, body: data });
}

export async function resetAgentUserPassword(agentToken: string, id: string, new_password: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/v1/support-agent/users/${id}/reset-password`, { method: "POST", token: agentToken, body: { new_password } });
}

export async function fetchAgentModerators(agentToken: string): Promise<{ moderators: { id: string; name: string; email: string; created_at: string }[] }> {
  return apiRequest<{ moderators: { id: string; name: string; email: string; created_at: string }[] }>("/v1/support-agent/moderators", { method: "GET", token: agentToken });
}
