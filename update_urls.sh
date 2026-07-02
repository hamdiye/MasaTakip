#!/bin/bash
# Update MenuUrunKarti.jsx
sed -i '' -e 's/const base = import.meta.env.VITE_API_URL.*/const base = import.meta.env.DEV ? "http:\/\/localhost:5115" : "";/' masa-takip-ui/src/components/masa-detay/MenuUrunKarti.jsx
sed -i '' -e 's/?? (import.meta.env.DEV ? '\'''\'' : window.location.origin)//' masa-takip-ui/src/components/masa-detay/MenuUrunKarti.jsx

# Update MenuYonetimPage.jsx
sed -i '' -e 's/const base = import.meta.env.VITE_API_URL.*/const base = import.meta.env.DEV ? "http:\/\/localhost:5115" : "";/' masa-takip-ui/src/pages/MenuYonetimPage.jsx
sed -i '' -e 's/?? (import.meta.env.DEV ? '\'''\'' : window.location.origin)//' masa-takip-ui/src/pages/MenuYonetimPage.jsx
