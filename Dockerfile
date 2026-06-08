FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Kumpulan nilai dummy agar Next.js sukses dilewati saat proses kompilasi static
ENV MONGODB_URI="mongodb://localhost:27017/dummy"
ENV JWT_SECRET="dummy_secret_key_for_build_stage_only"

RUN npm run build
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p ${PORT:-8080}"]