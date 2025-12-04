#!/bin/bash

# ===========================================
# Tech Roadmap Tracker - Debian Setup Script
# ===========================================
# Tested on: Debian 12 (Bookworm) / Ubuntu 22.04+
# Usage: chmod +x setup-debian.sh && sudo ./setup-debian.sh
# ===========================================

set -e  # Exit on error

echo "🚀 Tech Roadmap Tracker - Debian Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./setup-debian.sh)${NC}"
    exit 1
fi

# Get the actual user (not root)
ACTUAL_USER=${SUDO_USER:-$USER}
ACTUAL_HOME=$(eval echo ~$ACTUAL_USER)

echo -e "${YELLOW}Installing for user: $ACTUAL_USER${NC}"

# ===========================================
# 1. SYSTEM UPDATE
# ===========================================
echo ""
echo -e "${GREEN}[1/6] Updating system packages...${NC}"
apt update && apt upgrade -y

# ===========================================
# 2. ESSENTIAL TOOLS
# ===========================================
echo ""
echo -e "${GREEN}[2/6] Installing essential tools...${NC}"
apt install -y \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    build-essential \
    apt-transport-https

# # ===========================================
# # 3. DOCKER
# # ===========================================
# echo ""
# echo -e "${GREEN}[3/6] Installing Docker...${NC}"

# # Remove old versions
# apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# # Add Docker GPG key
# install -m 0755 -d /etc/apt/keyrings
# curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
# chmod a+r /etc/apt/keyrings/docker.gpg

# # Add Docker repository
# echo \
#   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
#   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
#   tee /etc/apt/sources.list.d/docker.list > /dev/null

# # Install Docker
# apt update
# apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# # Add user to docker group (no sudo needed for docker commands)
# usermod -aG docker $ACTUAL_USER

# # Enable Docker on boot
# systemctl enable docker
# systemctl start docker

# echo -e "${GREEN}✓ Docker installed: $(docker --version)${NC}"

# ===========================================
# 4. NODE.JS (via NodeSource)
# ===========================================
echo ""
echo -e "${GREEN}[4/6] Installing Node.js 20 LTS...${NC}"

# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Update npm to latest
npm install -g npm@latest

echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
echo -e "${GREEN}✓ npm installed: $(npm --version)${NC}"



# ===========================================
# 6. ADDITIONAL DEV TOOLS
# ===========================================
echo ""
echo -e "${GREEN}[6/6] Installing additional tools...${NC}"

apt install -y \
    postgresql-client \
    jq \
    tree \
    htop

# Install global npm packages (as actual user)
su - $ACTUAL_USER -c "npm install -g pnpm yarn"

echo -e "${GREEN}✓ pnpm installed: $(su - $ACTUAL_USER -c 'pnpm --version')${NC}"

# ===========================================
# SUMMARY
# ===========================================
echo ""
echo "========================================"
echo -e "${GREEN}✅ Installation complete!${NC}"
echo "========================================"
echo ""
echo "Installed packages:"
echo "  • Docker:     $(docker --version | cut -d' ' -f3 | tr -d ',')"
echo "  • Node.js:    $(node --version)"
echo "  • npm:        $(npm --version)"
echo "  • Python:     $(python3 --version | cut -d' ' -f2)"
echo "  • pip:        $(pip3 --version | cut -d' ' -f2)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Log out and back in for Docker permissions to take effect!${NC}"
echo -e "${YELLOW}   Or run: newgrp docker${NC}"
echo ""
echo "Quick start:"
echo "  cd tech-roadmap-tracker/backend"
echo "  docker compose up -d"
echo ""
echo "Frontend:"
echo "  cd tech-roadmap-tracker"
echo "  npm install"
echo "  npm run dev"
echo ""
