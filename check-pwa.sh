#!/bin/bash

# Script para verificar la configuración PWA

echo "🔍 Verificando configuración PWA..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar archivo
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 existe"
    return 0
  else
    echo -e "${RED}✗${NC} $1 NO existe"
    return 1
  fi
}

# Función para verificar tamaño de imagen
check_image_size() {
  if command -v identify &> /dev/null; then
    size=$(identify -format "%wx%h" "$1" 2>/dev/null)
    if [ "$size" = "$2" ]; then
      echo -e "  ${GREEN}→${NC} Tamaño correcto: $size"
    else
      echo -e "  ${YELLOW}→${NC} Tamaño actual: $size (esperado: $2)"
    fi
  fi
}

echo "📱 Iconos PWA:"
echo "─────────────"
check_file "public/icon-192.png"
check_image_size "public/icon-192.png" "192x192"

check_file "public/icon-512.png"
check_image_size "public/icon-512.png" "512x512"

check_file "public/apple-touch-icon.png"
check_image_size "public/apple-touch-icon.png" "180x180"

check_file "public/favicon.ico"
echo ""

echo "📄 Archivos de configuración:"
echo "────────────────────────────"
check_file "vite.config.ts"
check_file "index.html"
check_file ".env"
echo ""

echo "🔧 Dependencias PWA:"
echo "───────────────────"
if grep -q "vite-plugin-pwa" package.json; then
  echo -e "${GREEN}✓${NC} vite-plugin-pwa instalado"
else
  echo -e "${RED}✗${NC} vite-plugin-pwa NO instalado"
fi
echo ""

echo "📝 Meta tags en index.html:"
echo "──────────────────────────"
if grep -q "theme-color" index.html; then
  echo -e "${GREEN}✓${NC} theme-color configurado"
else
  echo -e "${RED}✗${NC} theme-color falta"
fi

if grep -q "apple-mobile-web-app-capable" index.html; then
  echo -e "${GREEN}✓${NC} apple-mobile-web-app-capable configurado"
else
  echo -e "${RED}✗${NC} apple-mobile-web-app-capable falta"
fi

if grep -q "apple-touch-icon" index.html; then
  echo -e "${GREEN}✓${NC} apple-touch-icon configurado"
else
  echo -e "${RED}✗${NC} apple-touch-icon falta"
fi
echo ""

echo "🌐 Variables de entorno:"
echo "───────────────────────"
if [ -f ".env" ]; then
  if grep -q "VITE_PRIVY_APP_ID" .env; then
    echo -e "${GREEN}✓${NC} VITE_PRIVY_APP_ID configurado"
  else
    echo -e "${RED}✗${NC} VITE_PRIVY_APP_ID falta"
  fi
  
  if grep -q "VITE_API_URL" .env; then
    echo -e "${GREEN}✓${NC} VITE_API_URL configurado"
  else
    echo -e "${RED}✗${NC} VITE_API_URL falta"
  fi
else
  echo -e "${RED}✗${NC} Archivo .env no encontrado"
fi
echo ""

echo "──────────────────────────────────────"
echo -e "${GREEN}✨ Verificación completa!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Reemplaza los iconos placeholder con iconos reales"
echo "  2. Ejecuta: yarn dev"
echo "  3. Prueba la instalación en Chrome/Safari"
echo "  4. Ejecuta Lighthouse en DevTools"
echo ""
echo "📖 Más info: Lee PWA_GUIDE.md"
