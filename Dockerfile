FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Tambahkan baris di bawah ini agar Next.js tidak eror saat proses build static page
ENV MONGODB_URI="mongodb://localhost:27017/dummy"

RUN npm run build
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p ${PORT:-8080}"]