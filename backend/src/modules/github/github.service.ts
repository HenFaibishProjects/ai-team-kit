import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  /**
   * Verify GitHub token and get user info
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.users.getAuthenticated();
      return {
        success: true,
        user: {
          login: data.login,
          name: data.name,
          email: data.email,
          avatar_url: data.avatar_url,
        },
      };
    } catch (error) {
      console.error('GitHub token verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid GitHub token';
      throw new HttpException(
        `GitHub authentication failed: ${errorMessage}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(token: string): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        language: repo.language,
        default_branch: repo.default_branch,
      }));
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch repositories';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get repository details
   */
  async getRepositoryDetails(
    token: string,
    owner: string,
    repo: string,
  ): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });

      // Get repository info
      const { data: repoData } = await octokit.repos.get({ owner, repo });

      // Get repository structure (root directory)
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path: '',
      });

      // Get recent commits
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 10,
      });

      // Get languages
      const { data: languages } = await octokit.repos.listLanguages({
        owner,
        repo,
      });

      // Get contributors
      const { data: contributors } = await octokit.repos.listContributors({
        owner,
        repo,
        per_page: 10,
      });

      return {
        repository: {
          id: repoData.id,
          name: repoData.name,
          full_name: repoData.full_name,
          description: repoData.description,
          private: repoData.private,
          html_url: repoData.html_url,
          created_at: repoData.created_at,
          updated_at: repoData.updated_at,
          language: repoData.language,
          default_branch: repoData.default_branch,
          size: repoData.size,
          stargazers_count: repoData.stargazers_count,
          watchers_count: repoData.watchers_count,
          forks_count: repoData.forks_count,
          open_issues_count: repoData.open_issues_count,
        },
        structure: Array.isArray(contents)
          ? contents.map((item) => ({
              name: item.name,
              path: item.path,
              type: item.type,
              size: item.size,
            }))
          : [],
        commits: commits.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name || 'Unknown',
          date: commit.commit.author?.date || new Date().toISOString(),
        })),
        languages,
        contributors: contributors.map((contributor) => ({
          login: contributor.login,
          contributions: contributor.contributions,
          avatar_url: contributor.avatar_url,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch repository details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch repository details';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get directory structure recursively
   */
  async getDirectoryStructure(
    token: string,
    owner: string,
    repo: string,
    path: string = '',
  ): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.repos.getContent({ owner, repo, path });

      if (Array.isArray(data)) {
        return data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
        }));
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch directory structure:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch directory structure';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Parse repository URL to extract owner and repo name
   */
  parseGithubUrl(url: string): { owner: string; repo: string } | null {
    const regex =
      /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(\.git)?/;
    const match = url.match(regex);

    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }

    return null;
  }
}
