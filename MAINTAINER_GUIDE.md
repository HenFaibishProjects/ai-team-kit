# Virtual Team Kit - Maintainer Guide

## Publishing & Distribution Guide for Project Maintainers

This guide explains how to prepare, build, and distribute the Virtual Team Kit as a Docker image for public use.

---

## Table of Contents
1. [Pre-Release Checklist](#pre-release-checklist)
2. [Building Docker Images](#building-docker-images)
3. [Publishing to Docker Hub](#publishing-to-docker-hub)
4. [Publishing to GitHub Container Registry](#publishing-to-github-container-registry)
5. [Creating GitHub Releases](#creating-github-releases)
6. [Documentation Updates](#documentation-updates)
7. [Version Management](#version-management)

---

## Pre-Release Checklist

Before publishing a new version, ensure:

- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated with new version
- [ ] Version numbers are updated in:
  - `backend/package.json`
  - `frontend/package.json`
  - `docker-compose.yml` (image tags)
- [ ] Environment variables are documented in `.env.example`
- [ ] Security vulnerabilities are addressed (`npm audit`)
- [ ] Database migrations are tested
- [ ] All features work in production mode

---

## Building Docker Images

### 1. Set Version Variables

```bash
export VERSION="1.0.0"
export DOCKER_USERNAME="your-dockerhub-username"
```

### 2. Build All Images

```bash
# Build backend image
docker build -t ${DOCKER_USERNAME}/virtual-team-kit-backend:${VERSION} \
             -t ${DOCKER_USERNAME}/virtual-team-kit-backend:latest \
             ./backend

# Build frontend image
docker build -t ${DOCKER_USERNAME}/virtual-team-kit-frontend:${VERSION} \
             -t ${DOCKER_USERNAME}/virtual-team-kit-frontend:latest \
             ./frontend

# Build nginx image (if customized)
docker build -t ${DOCKER_USERNAME}/virtual-team-kit-nginx:${VERSION} \
             -t ${DOCKER_USERNAME}/virtual-team-kit-nginx:latest \
             ./nginx
```

### 3. Test Images Locally

```bash
# Test with docker-compose
docker-compose up

# Verify all services are running
docker-compose ps

# Test the application
# Open http://localhost in your browser
# Test all major features

# Clean up
docker-compose down
```

---

## Publishing to Docker Hub

### 1. Login to Docker Hub

```bash
docker login
# Enter your Docker Hub credentials
```

### 2. Push Images

```bash
# Push backend
docker push ${DOCKER_USERNAME}/virtual-team-kit-backend:${VERSION}
docker push ${DOCKER_USERNAME}/virtual-team-kit-backend:latest

# Push frontend
docker push ${DOCKER_USERNAME}/virtual-team-kit-frontend:${VERSION}
docker push ${DOCKER_USERNAME}/virtual-team-kit-frontend:latest

# Push nginx (if applicable)
docker push ${DOCKER_USERNAME}/virtual-team-kit-nginx:${VERSION}
docker push ${DOCKER_USERNAME}/virtual-team-kit-nginx:latest
```

### 3. Update Docker Hub Repository

1. Go to https://hub.docker.com/
2. Navigate to your repository
3. Update the README with:
   - Project description
   - Quick start instructions
   - Link to full documentation
   - Version information

---

## Publishing to GitHub Container Registry (GHCR)

### 1. Create Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `write:packages` and `read:packages` scopes
3. Save the token securely

### 2. Login to GHCR

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 3. Tag and Push Images

```bash
# Tag images for GHCR
docker tag ${DOCKER_USERNAME}/virtual-team-kit-backend:${VERSION} \
           ghcr.io/YOUR_GITHUB_USERNAME/virtual-team-kit-backend:${VERSION}

docker tag ${DOCKER_USERNAME}/virtual-team-kit-frontend:${VERSION} \
           ghcr.io/YOUR_GITHUB_USERNAME/virtual-team-kit-frontend:${VERSION}

# Push to GHCR
docker push ghcr.io/YOUR_GITHUB_USERNAME/virtual-team-kit-backend:${VERSION}
docker push ghcr.io/YOUR_GITHUB_USERNAME/virtual-team-kit-frontend:${VERSION}
```

---

## Creating GitHub Releases

### 1. Prepare Release Notes

Create a file `RELEASE_NOTES.md` with:

```markdown
# Virtual Team Kit v1.0.0

## 🎉 New Features
- Feature 1 description
- Feature 2 description

## 🐛 Bug Fixes
- Fix 1 description
- Fix 2 description

## 📚 Documentation
- Updated user guide
- Added troubleshooting section

## 🔧 Technical Changes
- Upgraded dependencies
- Performance improvements

## 📦 Docker Images
- `dockerhub-username/virtual-team-kit-backend:1.0.0`
- `dockerhub-username/virtual-team-kit-frontend:1.0.0`

## 📖 Full Documentation
See [USER_GUIDE.md](USER_GUIDE.md) for installation and usage instructions.
```

### 2. Create Git Tag

```bash
git tag -a v${VERSION} -m "Release version ${VERSION}"
git push origin v${VERSION}
```

### 3. Create GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Draft a new release"
3. Select the tag you just created
4. Add release title: `Virtual Team Kit v${VERSION}`
5. Paste your release notes
6. Attach any additional files (if needed)
7. Click "Publish release"

---

## Documentation Updates

### Files to Update for Each Release

1. **README.md**
   - Update version badges
   - Update installation instructions if changed
   - Add new features to feature list

2. **USER_GUIDE.md**
   - Update with new features
   - Add troubleshooting for common issues
   - Update screenshots if UI changed

3. **CHANGELOG.md**
   - Add new version section
   - List all changes

4. **docker-compose.yml**
   - Update image tags to new version
   - Update any new environment variables

5. **.env.example**
   - Add any new required environment variables
   - Document their purpose

---

## Version Management

### Semantic Versioning

Follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Version Update Checklist

```bash
# 1. Update version in package.json files
cd backend && npm version ${VERSION}
cd ../frontend && npm version ${VERSION}

# 2. Update docker-compose.yml
# Edit image tags manually

# 3. Commit version changes
git add .
git commit -m "chore: bump version to ${VERSION}"

# 4. Create and push tag
git tag -a v${VERSION} -m "Release ${VERSION}"
git push origin main
git push origin v${VERSION}
```

---

## Distribution Checklist

Before announcing a new release:

- [ ] Docker images built and tested
- [ ] Images pushed to Docker Hub
- [ ] Images pushed to GHCR (optional)
- [ ] GitHub release created
- [ ] Release notes published
- [ ] Documentation updated
- [ ] USER_GUIDE.md reflects current version
- [ ] CHANGELOG.md updated
- [ ] Social media/announcement prepared (if applicable)

---

## Quick Release Script

Create a `release.sh` script:

```bash
#!/bin/bash

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./release.sh <version>"
    exit 1
fi

echo "🚀 Releasing Virtual Team Kit v${VERSION}"

# Build images
echo "📦 Building Docker images..."
docker-compose build

# Tag images
echo "🏷️  Tagging images..."
docker tag ai-team-kit-backend:latest ${DOCKER_USERNAME}/virtual-team-kit-backend:${VERSION}
docker tag ai-team-kit-frontend:latest ${DOCKER_USERNAME}/virtual-team-kit-frontend:${VERSION}

# Push images
echo "⬆️  Pushing to Docker Hub..."
docker push ${DOCKER_USERNAME}/virtual-team-kit-backend:${VERSION}
docker push ${DOCKER_USERNAME}/virtual-team-kit-frontend:${VERSION}
docker push ${DOCKER_USERNAME}/virtual-team-kit-backend:latest
docker push ${DOCKER_USERNAME}/virtual-team-kit-frontend:latest

# Create git tag
echo "🏷️  Creating git tag..."
git tag -a v${VERSION} -m "Release ${VERSION}"
git push origin v${VERSION}

echo "✅ Release complete! Don't forget to:"
echo "   1. Create GitHub release"
echo "   2. Update documentation"
echo "   3. Announce the release"
```

Make it executable:
```bash
chmod +x release.sh
```

Use it:
```bash
./release.sh 1.0.0
```

---

## Support & Maintenance

### Monitoring Issues

- Regularly check GitHub Issues
- Respond to user questions
- Triage and label issues appropriately
- Create milestones for upcoming releases

### Security Updates

- Monitor security advisories for dependencies
- Run `npm audit` regularly
- Update dependencies promptly
- Test thoroughly after updates

### Community Engagement

- Respond to pull requests
- Thank contributors
- Maintain CODE_OF_CONDUCT.md
- Update CONTRIBUTING.md with guidelines

---

## Contact & Resources

- **GitHub Repository**: https://github.com/YOUR_USERNAME/ai-team-kit
- **Docker Hub**: https://hub.docker.com/u/YOUR_USERNAME
- **Documentation**: See USER_GUIDE.md
- **Issues**: GitHub Issues page

---

**Last Updated**: November 2025
**Maintainer**: Your Name
**License**: MIT (or your chosen license)
