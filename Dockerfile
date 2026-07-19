# 1. Nginx ka sabse lightweight version use kar rahe hain
FROM nginx:alpine

# 2. Aapki static HTML, CSS, JS files ko Nginx ke default serving folder mein copy kar rahe hain
COPY . /usr/share/nginx/html

# 3. Nginx default port 80 par chalta hai
EXPOSE 80