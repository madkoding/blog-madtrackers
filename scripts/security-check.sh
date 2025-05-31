#!/bin/bash

# Script de validación de seguridad para MadTrackers
# Verifica que no haya credenciales expuestas en el código

echo "🔒 Revisión de Seguridad - MadTrackers"
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar archivos de entorno
check_env_files() {
	echo -e "\n📁 Verificando archivos de entorno..."

	if [ -f ".env.local" ]; then
		echo -e "${GREEN}✓${NC} .env.local existe"
	else
		echo -e "${RED}✗${NC} .env.local no encontrado"
	fi

	if [ -f ".env.local.example" ]; then
		echo -e "${GREEN}✓${NC} .env.local.example existe"
	else
		echo -e "${YELLOW}⚠${NC} .env.local.example no encontrado"
	fi
}

# Función para buscar credenciales hardcodeadas
check_hardcoded_secrets() {
	echo -e "\n🔍 Buscando credenciales hardcodeadas..."

	# Buscar API keys de Firebase
	firebase_keys=$(grep -r "AIzaSy" src/ --exclude-dir=node_modules 2>/dev/null || true)
	if [ -n "$firebase_keys" ]; then
		echo -e "${RED}✗${NC} Encontradas API keys de Firebase hardcodeadas:"
		echo "$firebase_keys"
	else
		echo -e "${GREEN}✓${NC} No se encontraron API keys de Firebase hardcodeadas"
	fi

	# Buscar otros patrones peligrosos
	secret_patterns=("sk-" "pk_" "rk_" "access_token" "secret_key")

	for pattern in "${secret_patterns[@]}"; do
		matches=$(grep -r "$pattern" src/ --exclude-dir=node_modules 2>/dev/null || true)
		if [ -n "$matches" ]; then
			echo -e "${YELLOW}⚠${NC} Posibles secretos encontrados con patrón '$pattern':"
			echo "$matches"
		fi
	done
}

# Función para verificar uso correcto de process.env
check_process_env() {
	echo -e "\n🌐 Verificando uso de variables de entorno..."

	env_usage=$(grep -r "process\.env\." src/ --exclude-dir=node_modules | wc -l)
	echo -e "${GREEN}✓${NC} Se encontraron $env_usage usos de process.env"

	# Mostrar algunos ejemplos
	echo -e "\nEjemplos de uso correcto:"
	grep -r "process\.env\." src/ --exclude-dir=node_modules | head -3
}

# Función para verificar .gitignore
check_gitignore() {
	echo -e "\n📝 Verificando .gitignore..."

	if grep -q ".env" .gitignore; then
		echo -e "${GREEN}✓${NC} .env está en .gitignore"
	else
		echo -e "${RED}✗${NC} .env NO está en .gitignore"
	fi

	if grep -q ".env.local" .gitignore; then
		echo -e "${GREEN}✓${NC} .env.local está en .gitignore"
	else
		echo -e "${RED}✗${NC} .env.local NO está en .gitignore"
	fi
}

# Ejecutar todas las verificaciones
check_env_files
check_hardcoded_secrets
check_process_env
check_gitignore

echo -e "\n✅ Revisión de seguridad completada"
echo -e "\n💡 Recomendaciones:"
echo -e "   • Nunca commitees archivos .env.local"
echo -e "   • Rota las credenciales si fueron expuestas"
echo -e "   • Usa variables de entorno para todos los secretos"
echo -e "   • Revisa regularmente el historial de Git"
