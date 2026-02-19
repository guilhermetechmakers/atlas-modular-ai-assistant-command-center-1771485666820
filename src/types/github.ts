export interface Repo {
  id: string
  full_name: string
  name: string
  private: boolean
}

export interface RepoActivityItem {
  id: string
  type: 'commit' | 'pull_request' | 'issue'
  title: string
  repo: string
  author?: string
  createdAt: string
  state?: string
}

export interface GitHubIssue {
  id: string
  number: number
  title: string
  state: 'open' | 'closed'
  body?: string
  repo: string
  author?: string
  createdAt: string
  updatedAt?: string
  labels?: string[]
}

export interface Milestone {
  id: string
  title: string
  dueDate?: string
  openIssues: number
  closedIssues: number
}
