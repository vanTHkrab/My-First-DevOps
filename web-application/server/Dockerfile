FROM node:24-alpine AS base

# ตั้งค่า Environment ให้ชี้ไปที่ /root
ENV HOME=/root
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# ติดตั้ง pnpm และสร้างโฟลเดอร์ที่จำเป็น
RUN npm install -g pnpm && \
    mkdir -p /root/.local/share/pnpm/store && \
    mkdir -p /root/app

# กำหนดโฟลเดอร์ทำงานหลัก
WORKDIR /root/app

# ก๊อปปี้ไฟล์ package มาติดตั้ง
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

# ก๊อปปี้โค้ดทั้งหมด
COPY . .

EXPOSE 3001

ENV NODE_ENV=development

CMD ["pnpm", "start:dev"]
