# frontend/Dockerfile - Version ultra-simple
FROM nginx:alpine

# Copier les fichiers statiques
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Modifier app.js directement avec sed
RUN sed -i "1i const API_URL = 'http://backend:3000';" /usr/share/nginx/html/app.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
