FROM node:20-slim

WORKDIR /workspace/app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

EXPOSE 3000
EXPOSE 3010

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
