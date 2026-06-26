FROM node:22

# Set Puppeteer environment variables to skip bundled Chromium download and use system Chromium instead
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install system dependencies (including Chromium, LibreOffice, Xvfb, Electron libraries, and standard fonts)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libreoffice \
    wget \
    xvfb \
    xauth \
    chromium \
    libx11-xcb1 \
    x11-apps \
    libasound2 \
    libgbm1 \
    libnss3 \
    libxss1 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libsecret-1-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libpangocairo-1.0-0 \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-khmeros \
    fonts-kacst \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Install Draw.io Desktop (Run apt-get update before apt-get install -f to ensure package lists exist)
RUN apt-get update && \
    wget https://github.com/jgraph/drawio-desktop/releases/download/v24.4.0/drawio-amd64-24.4.0.deb \
    && dpkg -i drawio-amd64-24.4.0.deb || apt-get install -f -y \
    && rm drawio-amd64-24.4.0.deb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install project dependencies (will respect PUPPETEER_SKIP_CHROMIUM_DOWNLOAD)
RUN npm install

# Install Mermaid CLI globally (will respect PUPPETEER_SKIP_CHROMIUM_DOWNLOAD)
RUN npm install -g @mermaid-js/mermaid-cli

COPY . .

EXPOSE 3000

CMD ["xvfb-run", "-a", "--auto-servernum", "--server-args=-screen 0 1024x768x24", "npm", "start"]