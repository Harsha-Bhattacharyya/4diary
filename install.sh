#!/bin/bash

# 4Diary Interactive Installer
# https://github.com/Harsha-Bhattacharyya/4diary
#
# Usage: curl -fsSL https://raw.githubusercontent.com/Harsha-Bhattacharyya/4diary/main/install.sh | bash
# Or: ./install.sh

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

REPO_URL="https://github.com/Harsha-Bhattacharyya/4diary.git"
INSTALL_DIR="4diary"

# ============================================================================
# COLORS & STYLING (Using ANSI escape codes)
# ============================================================================

# Reset
NC='\033[0m'

# Regular Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'

# Bold Colors
BOLD='\033[1m'
BOLD_RED='\033[1;31m'
BOLD_GREEN='\033[1;32m'
BOLD_YELLOW='\033[1;33m'
BOLD_BLUE='\033[1;34m'
BOLD_MAGENTA='\033[1;35m'
BOLD_CYAN='\033[1;36m'
BOLD_WHITE='\033[1;37m'

# Background Colors
BG_BLUE='\033[44m'
BG_GREEN='\033[42m'

# Dim
DIM='\033[2m'

# ============================================================================
# NERD FONT ICONS (Compatible with most terminals, fallback to ASCII)
# ============================================================================

# Detect if terminal supports Unicode
if [[ "$TERM" =~ "xterm" ]] || [[ "$TERM" =~ "screen" ]] || [[ "$TERM" =~ "tmux" ]] || [[ -n "$WT_SESSION" ]]; then
    ICON_ROCKET="🚀"
    ICON_LOCK="🔒"
    ICON_DATABASE="🗄️"
    ICON_REDIS="⚡"
    ICON_DOCKER="🐳"
    ICON_NODE="📦"
    ICON_CHECK="✅"
    ICON_CROSS="❌"
    ICON_WARN="⚠️"
    ICON_INFO="ℹ️"
    ICON_ARROW="➜"
    ICON_STAR="⭐"
    ICON_GEAR="⚙️"
    ICON_KEY="🔑"
    ICON_FOLDER="📁"
    ICON_BOOK="📖"
    ICON_HEART="❤️"
    ICON_SPARKLE="✨"
    ICON_PENCIL="✏️"
    ICON_GLOBE="🌐"
else
    ICON_ROCKET="*"
    ICON_LOCK="[L]"
    ICON_DATABASE="[DB]"
    ICON_REDIS="[R]"
    ICON_DOCKER="[D]"
    ICON_NODE="[N]"
    ICON_CHECK="[OK]"
    ICON_CROSS="[X]"
    ICON_WARN="[!]"
    ICON_INFO="[i]"
    ICON_ARROW="->"
    ICON_STAR="*"
    ICON_GEAR="[G]"
    ICON_KEY="[K]"
    ICON_FOLDER="[F]"
    ICON_BOOK="[B]"
    ICON_HEART="<3"
    ICON_SPARKLE="*"
    ICON_PENCIL="[E]"
    ICON_GLOBE="[W]"
fi

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_banner() {
    echo ""
    echo -e "${BOLD_MAGENTA}"
    echo "  ██╗  ██╗██████╗ ██╗ █████╗ ██████╗ ██╗   ██╗"
    echo "  ██║  ██║██╔══██╗██║██╔══██╗██╔══██╗╚██╗ ██╔╝"
    echo "  ███████║██║  ██║██║███████║██████╔╝ ╚████╔╝ "
    echo "  ╚════██║██║  ██║██║██╔══██║██╔══██╗  ╚██╔╝  "
    echo "       ██║██████╔╝██║██║  ██║██║  ██║   ██║   "
    echo "       ╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   "
    echo -e "${NC}"
    echo -e "${DIM}${CYAN}  Privacy-focused, end-to-end encrypted notes${NC}"
    echo ""
    echo -e "  ${ICON_LOCK} ${BOLD_WHITE}Military-grade encryption${NC}  ${ICON_KEY} ${BOLD_WHITE}Zero-knowledge${NC}  ${ICON_BOOK} ${BOLD_WHITE}Notion-like editing${NC}"
    echo ""
    echo -e "${DIM}────────────────────────────────────────────────────────${NC}"
    echo ""
}

print_step() {
    echo -e "${BOLD_CYAN}${ICON_ARROW}${NC} ${BOLD_WHITE}$1${NC}"
}

print_substep() {
    echo -e "  ${DIM}├─${NC} $1"
}

print_success() {
    echo -e "${BOLD_GREEN}${ICON_CHECK}${NC} ${GREEN}$1${NC}"
}

print_error() {
    echo -e "${BOLD_RED}${ICON_CROSS}${NC} ${RED}$1${NC}"
}

print_warning() {
    echo -e "${BOLD_YELLOW}${ICON_WARN}${NC} ${YELLOW}$1${NC}"
}

print_info() {
    echo -e "${BOLD_BLUE}${ICON_INFO}${NC} ${BLUE}$1${NC}"
}

print_section() {
    echo ""
    echo -e "${BOLD_MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD_WHITE}  $1${NC}"
    echo -e "${BOLD_MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

prompt_input() {
    local prompt="$1"
    local default="$2"
    local result

    if [[ -n "$default" ]]; then
        echo -ne "${BOLD_CYAN}${ICON_PENCIL}${NC} ${WHITE}$prompt ${DIM}[$default]${NC}: "
        read -r result
        result="${result:-$default}"
    else
        echo -ne "${BOLD_CYAN}${ICON_PENCIL}${NC} ${WHITE}$prompt${NC}: "
        read -r result
    fi
    echo "$result"
}

prompt_password() {
    local prompt="$1"
    local result

    echo -ne "${BOLD_CYAN}${ICON_KEY}${NC} ${WHITE}$prompt${NC}: "
    read -rs result
    echo ""
    echo "$result"
}

prompt_confirm() {
    local prompt="$1"
    local default="${2:-y}"
    local result

    if [[ "$default" == "y" ]]; then
        echo -ne "${BOLD_YELLOW}${ICON_WARN}${NC} ${WHITE}$prompt${NC} ${DIM}[Y/n]${NC}: "
    else
        echo -ne "${BOLD_YELLOW}${ICON_WARN}${NC} ${WHITE}$prompt${NC} ${DIM}[y/N]${NC}: "
    fi

    read -r result
    result="${result:-$default}"
    
    [[ "$result" =~ ^[Yy]$ ]]
}

prompt_choice() {
    local prompt="$1"
    shift
    local options=("$@")
    local choice

    echo -e "${BOLD_CYAN}${ICON_GEAR}${NC} ${BOLD_WHITE}$prompt${NC}"
    echo ""
    
    for i in "${!options[@]}"; do
        echo -e "  ${BOLD_MAGENTA}$((i + 1))${NC}${DIM})${NC} ${options[$i]}"
    done
    echo ""
    
    while true; do
        echo -ne "${BOLD_CYAN}${ICON_ARROW}${NC} ${WHITE}Enter choice [1-${#options[@]}]${NC}: "
        read -r choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le ${#options[@]} ]]; then
            echo "$choice"
            return
        fi
        print_error "Invalid choice. Please enter a number between 1 and ${#options[@]}"
    done
}

# ============================================================================
# SYSTEM CHECKS
# ============================================================================

check_dependencies() {
    print_section "${ICON_GEAR} Checking System Requirements"
    
    local missing_deps=()
    
    # Check for git
    print_substep "Checking for git..."
    if command -v git &> /dev/null; then
        print_success "git is installed ($(git --version | cut -d' ' -f3))"
    else
        missing_deps+=("git")
        print_error "git is not installed"
    fi
    
    # Check for curl or wget
    print_substep "Checking for curl/wget..."
    if command -v curl &> /dev/null; then
        print_success "curl is installed"
    elif command -v wget &> /dev/null; then
        print_success "wget is installed"
    else
        missing_deps+=("curl")
        print_error "Neither curl nor wget is installed"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        echo ""
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_info "Please install the missing dependencies and try again."
        exit 1
    fi
}

check_node() {
    print_substep "Checking for Node.js..."
    if command -v node &> /dev/null; then
        local node_version
        node_version=$(node --version | sed 's/v//')
        local major_version
        major_version=$(echo "$node_version" | cut -d. -f1)
        
        if [[ "$major_version" -ge 20 ]]; then
            print_success "Node.js v$node_version (meets requirement: v20+)"
            return 0
        else
            print_warning "Node.js v$node_version found (v20+ recommended)"
            return 1
        fi
    else
        print_warning "Node.js is not installed"
        return 1
    fi
}

check_docker() {
    print_substep "Checking for Docker..."
    if command -v docker &> /dev/null; then
        local docker_version
        docker_version=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
        print_success "Docker v$docker_version is installed"
        
        # Check if Docker daemon is running
        if docker info &> /dev/null; then
            print_success "Docker daemon is running"
            return 0
        else
            print_warning "Docker is installed but daemon is not running"
            return 1
        fi
    else
        print_warning "Docker is not installed"
        return 1
    fi
}

check_docker_compose() {
    print_substep "Checking for Docker Compose..."
    if command -v docker-compose &> /dev/null; then
        local compose_version
        compose_version=$(docker-compose --version | grep -oP '\d+\.\d+\.\d+' | head -1)
        print_success "Docker Compose v$compose_version is installed"
        return 0
    elif docker compose version &> /dev/null 2>&1; then
        local compose_version
        compose_version=$(docker compose version | grep -oP '\d+\.\d+\.\d+' | head -1)
        print_success "Docker Compose (plugin) v$compose_version is installed"
        return 0
    else
        print_warning "Docker Compose is not installed"
        return 1
    fi
}

# ============================================================================
# CONFIGURATION COLLECTION
# ============================================================================

collect_docker_config() {
    print_section "${ICON_DOCKER} Docker Configuration"
    
    echo -e "${DIM}Configure your Docker deployment settings.${NC}"
    echo -e "${DIM}Press Enter to accept default values shown in brackets.${NC}"
    echo ""
    
    # MongoDB Configuration
    echo -e "${BOLD_WHITE}${ICON_DATABASE} MongoDB Configuration${NC}"
    echo ""
    
    USE_EXTERNAL_MONGO=$(prompt_choice "MongoDB setup" \
        "${ICON_DOCKER} Use Docker MongoDB (recommended for self-hosting)" \
        "${ICON_GLOBE} Use external MongoDB (MongoDB Atlas or existing server)")
    
    if [[ "$USE_EXTERNAL_MONGO" == "2" ]]; then
        MONGODB_URI=$(prompt_input "MongoDB connection URI" "mongodb://localhost:27017/4diary")
    else
        MONGODB_URI="mongodb://mongodb:27017/4diary"
        print_info "Using Docker MongoDB with default connection"
    fi
    echo ""
    
    # Redis Configuration
    echo -e "${BOLD_WHITE}${ICON_REDIS} Redis Configuration${NC}"
    echo -e "${DIM}Redis is optional but required for share links feature${NC}"
    echo ""
    
    USE_EXTERNAL_REDIS=$(prompt_choice "Redis setup" \
        "${ICON_DOCKER} Use Docker Redis (recommended)" \
        "${ICON_GLOBE} Use external Redis" \
        "${ICON_CROSS} Skip Redis (share links will be unavailable)")
    
    case "$USE_EXTERNAL_REDIS" in
        1)
            REDIS_URL="redis://redis:6379"
            print_info "Using Docker Redis with default connection"
            ;;
        2)
            REDIS_URL=$(prompt_input "Redis connection URL" "redis://localhost:6379")
            ;;
        3)
            REDIS_URL=""
            print_warning "Share links feature will be unavailable"
            ;;
    esac
    echo ""
    
    # Application Configuration
    echo -e "${BOLD_WHITE}${ICON_GLOBE} Application Configuration${NC}"
    echo ""
    
    APP_PORT=$(prompt_input "Application port" "3000")
    BASE_URL=$(prompt_input "Base URL (for share links)" "http://localhost:$APP_PORT")
    
    echo ""
}

collect_dev_config() {
    print_section "${ICON_NODE} Development Configuration"
    
    echo -e "${DIM}Configure your local development environment.${NC}"
    echo -e "${DIM}Press Enter to accept default values shown in brackets.${NC}"
    echo ""
    
    # MongoDB Configuration
    echo -e "${BOLD_WHITE}${ICON_DATABASE} MongoDB Configuration${NC}"
    echo ""
    
    MONGODB_URI=$(prompt_input "MongoDB connection URI" "mongodb://localhost:27017/4diary")
    echo ""
    
    # Redis Configuration
    echo -e "${BOLD_WHITE}${ICON_REDIS} Redis Configuration${NC}"
    echo -e "${DIM}Redis is optional but required for share links feature${NC}"
    echo ""
    
    if prompt_confirm "Configure Redis for share links?"; then
        REDIS_URL=$(prompt_input "Redis connection URL" "redis://localhost:6379")
    else
        REDIS_URL=""
        print_warning "Share links feature will be unavailable"
    fi
    echo ""
    
    # Application Configuration
    echo -e "${BOLD_WHITE}${ICON_GLOBE} Application Configuration${NC}"
    echo ""
    
    APP_PORT="3000"
    BASE_URL=$(prompt_input "Base URL" "http://localhost:$APP_PORT")
    
    echo ""
}

collect_sentry_config() {
    echo -e "${BOLD_WHITE}${ICON_WARN} Sentry Error Tracking (Optional)${NC}"
    echo -e "${DIM}Sentry helps track errors and monitor application health${NC}"
    echo ""
    
    if prompt_confirm "Configure Sentry error tracking?" "n"; then
        SENTRY_DSN=$(prompt_input "Sentry DSN")
        SENTRY_ORG=$(prompt_input "Sentry Organization")
        SENTRY_PROJECT=$(prompt_input "Sentry Project")
        SENTRY_AUTH_TOKEN=$(prompt_password "Sentry Auth Token")
    else
        SENTRY_DSN=""
        SENTRY_ORG=""
        SENTRY_PROJECT=""
        SENTRY_AUTH_TOKEN=""
    fi
    echo ""
}

# ============================================================================
# CONFIGURATION GENERATION
# ============================================================================

generate_env_file() {
    local target_file="$1"
    
    cat > "$target_file" << EOF
# 4Diary Configuration
# Generated by install.sh on $(date)

# Database
MONGODB_URI=$MONGODB_URI

# Redis (Optional - Required for share tokens feature)
# If not configured, ephemeral share links will be unavailable
EOF

    if [[ -n "$REDIS_URL" ]]; then
        echo "REDIS_URL=$REDIS_URL" >> "$target_file"
    else
        echo "# REDIS_URL=redis://localhost:6379" >> "$target_file"
    fi

    cat >> "$target_file" << EOF

# Application
NEXT_PUBLIC_BASE_URL=$BASE_URL
EOF

    if [[ -n "$SENTRY_DSN" ]]; then
        cat >> "$target_file" << EOF

# Sentry (Error tracking)
NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN
SENTRY_ORG=$SENTRY_ORG
SENTRY_PROJECT=$SENTRY_PROJECT
SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
EOF
    else
        cat >> "$target_file" << EOF

# Sentry (Optional - Error tracking)
# NEXT_PUBLIC_SENTRY_DSN=
# SENTRY_ORG=
# SENTRY_PROJECT=
# SENTRY_AUTH_TOKEN=
EOF
    fi

    cat >> "$target_file" << EOF

# Vercel Analytics (Optional - Automatically enabled on Vercel deployments)
# No configuration needed - analytics are automatically injected when deployed to Vercel
EOF
}

generate_docker_compose_override() {
    local target_file="$1"
    
    cat > "$target_file" << EOF
# 4Diary Docker Compose Override
# Generated by install.sh on $(date)
# This file overrides settings from docker-compose.yml

version: '3.8'

services:
  app:
    ports:
      - "${APP_PORT}:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
EOF

    if [[ -n "$REDIS_URL" ]]; then
        echo "      - REDIS_URL=${REDIS_URL}" >> "$target_file"
    fi
    
    echo "      - NEXT_PUBLIC_BASE_URL=${BASE_URL}" >> "$target_file"

    if [[ -n "$SENTRY_DSN" ]]; then
        cat >> "$target_file" << EOF
      - NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
      - SENTRY_ORG=${SENTRY_ORG}
      - SENTRY_PROJECT=${SENTRY_PROJECT}
      - SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
EOF
    fi

    # Add external services configuration if needed
    if [[ "$USE_EXTERNAL_MONGO" == "2" ]]; then
        cat >> "$target_file" << EOF
    depends_on: []
EOF
    fi
}

# ============================================================================
# INSTALLATION
# ============================================================================

clone_repository() {
    print_section "${ICON_FOLDER} Cloning Repository"
    
    if [[ -d "$INSTALL_DIR" ]]; then
        print_warning "Directory '$INSTALL_DIR' already exists"
        if prompt_confirm "Remove existing directory and continue?"; then
            rm -rf "$INSTALL_DIR"
        else
            print_error "Installation cancelled"
            exit 1
        fi
    fi
    
    print_step "Cloning 4Diary repository..."
    if git clone "$REPO_URL" "$INSTALL_DIR" 2>&1 | while read -r line; do
        echo -e "  ${DIM}${line}${NC}"
    done; then
        print_success "Repository cloned successfully"
    else
        print_error "Failed to clone repository"
        exit 1
    fi
    
    cd "$INSTALL_DIR" || exit 1
}

install_docker() {
    print_section "${ICON_DOCKER} Setting Up Docker Deployment"
    
    print_step "Generating environment configuration..."
    generate_env_file ".env"
    print_success "Created .env file"
    
    print_step "Generating Docker Compose override..."
    generate_docker_compose_override "docker-compose.override.yml"
    print_success "Created docker-compose.override.yml"
    
    echo ""
    print_info "Docker configuration complete!"
    echo ""
    
    if prompt_confirm "Start Docker containers now?"; then
        print_step "Building and starting containers..."
        echo ""
        
        if docker compose up -d --build 2>&1 | while read -r line; do
            echo -e "  ${DIM}${line}${NC}"
        done; then
            echo ""
            print_success "Docker containers started successfully!"
        else
            print_error "Failed to start Docker containers"
            print_info "You can try manually with: docker compose up -d --build"
        fi
    else
        echo ""
        print_info "To start later, run:"
        echo -e "  ${CYAN}cd $INSTALL_DIR && docker compose up -d --build${NC}"
    fi
}

install_dev() {
    print_section "${ICON_NODE} Setting Up Development Environment"
    
    print_step "Generating environment configuration..."
    generate_env_file ".env.local"
    print_success "Created .env.local file"
    
    print_step "Installing dependencies..."
    echo ""
    
    if npm install 2>&1 | while read -r line; do
        echo -e "  ${DIM}${line}${NC}"
    done; then
        echo ""
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    
    echo ""
    print_info "Development setup complete!"
    echo ""
    
    if prompt_confirm "Start development server now?"; then
        print_step "Starting development server..."
        echo ""
        print_info "Press Ctrl+C to stop the server"
        echo ""
        npm run dev
    else
        echo ""
        print_info "To start the development server later, run:"
        echo -e "  ${CYAN}cd $INSTALL_DIR && npm run dev${NC}"
    fi
}

# ============================================================================
# SUMMARY
# ============================================================================

print_summary() {
    print_section "${ICON_SPARKLE} Installation Complete!"
    
    echo -e "${BOLD_GREEN}${ICON_CHECK} 4Diary has been installed successfully!${NC}"
    echo ""
    
    echo -e "${BOLD_WHITE}${ICON_FOLDER} Installation Directory:${NC}"
    echo -e "  ${CYAN}$(pwd)${NC}"
    echo ""
    
    echo -e "${BOLD_WHITE}${ICON_GLOBE} Application URL:${NC}"
    echo -e "  ${CYAN}${BASE_URL}${NC}"
    echo ""
    
    echo -e "${BOLD_WHITE}${ICON_GEAR} Configuration Files:${NC}"
    if [[ "$INSTALL_MODE" == "1" ]]; then
        echo -e "  ${DIM}├─${NC} .env"
        echo -e "  ${DIM}└─${NC} docker-compose.override.yml"
    else
        echo -e "  ${DIM}└─${NC} .env.local"
    fi
    echo ""
    
    echo -e "${BOLD_WHITE}${ICON_BOOK} Quick Start Commands:${NC}"
    if [[ "$INSTALL_MODE" == "1" ]]; then
        echo -e "  ${DIM}Start:${NC}   ${CYAN}docker compose up -d${NC}"
        echo -e "  ${DIM}Stop:${NC}    ${CYAN}docker compose down${NC}"
        echo -e "  ${DIM}Logs:${NC}    ${CYAN}docker compose logs -f app${NC}"
        echo -e "  ${DIM}Rebuild:${NC} ${CYAN}docker compose up -d --build${NC}"
    else
        echo -e "  ${DIM}Dev:${NC}     ${CYAN}npm run dev${NC}"
        echo -e "  ${DIM}Build:${NC}   ${CYAN}npm run build${NC}"
        echo -e "  ${DIM}Start:${NC}   ${CYAN}npm run start${NC}"
        echo -e "  ${DIM}Lint:${NC}    ${CYAN}npm run lint${NC}"
        echo -e "  ${DIM}Test:${NC}    ${CYAN}npm test${NC}"
    fi
    echo ""
    
    echo -e "${BOLD_WHITE}${ICON_STAR} Features:${NC}"
    echo -e "  ${DIM}├─${NC} ${ICON_LOCK} End-to-end encryption (AES-256-GCM)"
    echo -e "  ${DIM}├─${NC} ${ICON_KEY} Zero-knowledge architecture"
    echo -e "  ${DIM}├─${NC} ${ICON_PENCIL} Notion-like rich text editor"
    echo -e "  ${DIM}├─${NC} ${ICON_FOLDER} Smart organization (folders, tags)"
    if [[ -n "$REDIS_URL" ]]; then
        echo -e "  ${DIM}└─${NC} ${ICON_GLOBE} Ephemeral share links"
    else
        echo -e "  ${DIM}└─${NC} ${DIM}${ICON_GLOBE} Share links (requires Redis)${NC}"
    fi
    echo ""
    
    echo -e "${BOLD_MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${DIM}Documentation:${NC} ${CYAN}https://github.com/Harsha-Bhattacharyya/4diary#readme${NC}"
    echo -e "  ${DIM}Report issues:${NC} ${CYAN}https://github.com/Harsha-Bhattacharyya/4diary/issues${NC}"
    echo ""
    echo -e "  Built with ${ICON_HEART} in 🇮🇳"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Clear screen and show banner
    clear
    print_banner
    
    # Check dependencies
    check_dependencies
    
    # Check optional dependencies
    HAS_NODE=$(check_node && echo "yes" || echo "no")
    HAS_DOCKER=$(check_docker && echo "yes" || echo "no")
    HAS_COMPOSE=$(check_docker_compose && echo "yes" || echo "no")
    
    echo ""
    
    # Determine available installation options
    local install_options=()
    local option_indices=()
    
    if [[ "$HAS_DOCKER" == "yes" ]] && [[ "$HAS_COMPOSE" == "yes" ]]; then
        install_options+=("${ICON_DOCKER} Docker (recommended for production)")
        option_indices+=("docker")
    fi
    
    if [[ "$HAS_NODE" == "yes" ]]; then
        install_options+=("${ICON_NODE} Local Development (Node.js)")
        option_indices+=("dev")
    fi
    
    if [[ ${#install_options[@]} -eq 0 ]]; then
        print_error "No suitable installation method found!"
        echo ""
        print_info "Please install one of the following:"
        echo -e "  ${DIM}•${NC} Docker & Docker Compose (for production deployment)"
        echo -e "  ${DIM}•${NC} Node.js v20+ (for local development)"
        echo ""
        exit 1
    fi
    
    # Ask user to choose installation method
    print_section "${ICON_ROCKET} Choose Installation Method"
    
    INSTALL_MODE=$(prompt_choice "How would you like to install 4Diary?" "${install_options[@]}")
    INSTALL_TYPE="${option_indices[$((INSTALL_MODE - 1))]}"
    
    echo ""
    
    # Collect configuration based on installation type
    if [[ "$INSTALL_TYPE" == "docker" ]]; then
        collect_docker_config
    else
        collect_dev_config
    fi
    
    # Collect optional Sentry configuration
    collect_sentry_config
    
    # Show configuration summary
    print_section "${ICON_INFO} Configuration Summary"
    
    echo -e "${BOLD_WHITE}Installation Type:${NC} ${install_options[$((INSTALL_MODE - 1))]}"
    echo -e "${BOLD_WHITE}MongoDB:${NC} $MONGODB_URI"
    if [[ -n "$REDIS_URL" ]]; then
        echo -e "${BOLD_WHITE}Redis:${NC} $REDIS_URL"
    else
        echo -e "${BOLD_WHITE}Redis:${NC} ${DIM}Not configured${NC}"
    fi
    echo -e "${BOLD_WHITE}Base URL:${NC} $BASE_URL"
    if [[ -n "$SENTRY_DSN" ]]; then
        echo -e "${BOLD_WHITE}Sentry:${NC} Configured"
    else
        echo -e "${BOLD_WHITE}Sentry:${NC} ${DIM}Not configured${NC}"
    fi
    echo ""
    
    if ! prompt_confirm "Proceed with installation?"; then
        print_error "Installation cancelled"
        exit 1
    fi
    
    # Clone repository
    clone_repository
    
    # Run installation
    if [[ "$INSTALL_TYPE" == "docker" ]]; then
        install_docker
    else
        install_dev
    fi
    
    # Print summary
    print_summary
}

# Run main function
main "$@"
